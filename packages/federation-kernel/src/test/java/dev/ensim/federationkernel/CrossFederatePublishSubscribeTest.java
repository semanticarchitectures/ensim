package dev.ensim.federationkernel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/**
 * Proves cross-federate publish/subscribe over a real Portico HLA federation: launches two
 * separate JVM processes (the packaged jar, exactly as sim-services will eventually launch it),
 * one publishing an org-doctrine-model record, the other subscribing and reflecting it.
 *
 * This is really an integration test, not a unit test - it needs target/federation-kernel-0.1.0-SNAPSHOT.jar
 * already built. Maven's default lifecycle runs `test` BEFORE `package`, so on a clean checkout a
 * bare `mvn test` won't have the jar yet; run `mvn package` once first, then `mvn test` picks it
 * up. Assumptions.assumeTrue skips (rather than fails) when the jar is missing, since "run package
 * first" is a build-ordering precondition, not a code defect this test should report as a failure.
 *
 * Timing here encodes two things learned empirically against portico-2.1.4 (see README.md):
 *   1. A federate creating a fresh federation must settle briefly before another federate joins
 *      it, or Portico's JGroups coordinator can NPE on a near-simultaneous create/join race.
 *   2. Subscribing doesn't replay historical updates (standard HLA semantics) - the subscriber
 *      must be subscribed before the publisher's update, not just before federation join.
 */
class CrossFederatePublishSubscribeTest
{
    private static final Path JAR = Path.of( "target", "federation-kernel-0.1.0-SNAPSHOT.jar" );

    @Test
    void subscriberReflectsPublishersRecord() throws Exception
    {
        assumeTrue( Files.exists( JAR ), "target/federation-kernel-0.1.0-SNAPSHOT.jar not built - run `mvn package` first" );

        ObjectMapper mapper = new ObjectMapper();
        String federationName = "ensim-it-" + System.currentTimeMillis();

        Process publisher = launch();
        Process subscriber = null;
        try
        {
            send( publisher, mapper, "connect", "federationName", federationName, "federateName", "publisher" );
            readResponse( publisher, mapper ); // connect ok
            Thread.sleep( 3000 ); // let the publisher settle as sole federate before anyone else joins

            subscriber = launch();
            send( subscriber, mapper, "connect", "federationName", federationName, "federateName", "subscriber" );
            readResponse( subscriber, mapper ); // connect ok
            Thread.sleep( 1000 );

            send( subscriber, mapper, "subscribe" );
            readResponse( subscriber, mapper ); // subscribe ok
            Thread.sleep( 1000 );

            send( publisher, mapper, "publish", "entityType", "Organization", "entityId", "pacaf",
                  "record", mapper.readTree( "{\"id\":\"pacaf\",\"name\":\"Pacific Air Forces\",\"type\":\"MAJCOM\"}" ) );
            readResponse( publisher, mapper ); // publish ok
            Thread.sleep( 1000 );

            JsonNode tickResponse = sendAndRead( subscriber, mapper, "tick", "timeoutSeconds", 2.0 );
            JsonNode records = tickResponse.path( "records" );
            assertEquals( 1, records.size(), "expected exactly one reflected record: " + tickResponse );
            JsonNode record = records.get( 0 );
            assertEquals( "pacaf", record.path( "entityId" ).asText() );
            assertEquals( "Organization", record.path( "entityType" ).asText() );
            assertEquals( "pacaf", record.path( "record" ).path( "id" ).asText() );
            assertEquals( "Pacific Air Forces", record.path( "record" ).path( "name" ).asText() );
        }
        finally
        {
            resignQuietly( publisher, mapper );
            if( subscriber != null )
                resignQuietly( subscriber, mapper );
            publisher.destroy();
            if( subscriber != null )
                subscriber.destroy();
            publisher.waitFor( 5, TimeUnit.SECONDS );
            if( subscriber != null )
                subscriber.waitFor( 5, TimeUnit.SECONDS );
        }
    }

    private void resignQuietly( Process process, ObjectMapper mapper )
    {
        try
        {
            send( process, mapper, "resign" );
        }
        catch( IOException ignored )
        {
            // Process may already be gone - nothing more to clean up.
        }
    }

    private Process launch() throws IOException
    {
        return new ProcessBuilder( "java", "-jar", JAR.toString() )
            .redirectErrorStream( true )
            .start();
    }

    private JsonNode sendAndRead( Process process, ObjectMapper mapper, String cmd, Object... fields ) throws IOException
    {
        send( process, mapper, cmd, fields );
        return readResponse( process, mapper );
    }

    private void send( Process process, ObjectMapper mapper, String cmd, Object... fields ) throws IOException
    {
        var request = mapper.createObjectNode();
        request.put( "cmd", cmd );
        for( int i = 0; i < fields.length; i += 2 )
        {
            String key = (String)fields[i];
            Object value = fields[i + 1];
            if( value instanceof JsonNode node )
                request.set( key, node );
            else if( value instanceof Double d )
                request.put( key, d );
            else
                request.put( key, (String)value );
        }
        OutputStream stdin = process.getOutputStream();
        stdin.write( ( mapper.writeValueAsString( request ) + "\n" ).getBytes( StandardCharsets.UTF_8 ) );
        stdin.flush();
    }

    /** Reads stdout lines until one parses as JSON (skips Portico's own log noise on stdout/stderr). */
    private JsonNode readResponse( Process process, ObjectMapper mapper ) throws IOException
    {
        BufferedReader reader = new BufferedReader( new InputStreamReader( process.getInputStream(), StandardCharsets.UTF_8 ) );
        String line;
        while( ( line = reader.readLine() ) != null )
        {
            line = line.strip();
            if( line.startsWith( "{" ) )
                return mapper.readTree( line );
        }
        throw new IOException( "process closed stdout before returning a JSON response" );
    }
}
