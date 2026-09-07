package dev.ensim.federationkernel;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * JSON-over-stdio local interface for {@link OrgDoctrineFederate} - the narrow boundary
 * TypeScript packages (eventually sim-services) talk across so they never need an embedded
 * JVM (ARCHITECTURE.md Section 4a, this package's README).
 *
 * Protocol: one JSON object per line in, one JSON object per line out.
 * <pre>
 *   in:  {"cmd":"connect","federationName":"...","federateName":"..."}
 *   in:  {"cmd":"publish","entityType":"Organization","entityId":"pacaf","record":{...}}
 *   in:  {"cmd":"subscribe"}
 *   in:  {"cmd":"tick","timeoutSeconds":0.5}
 *   in:  {"cmd":"resign"}
 *   out: {"cmd":"...","ok":true,...}
 *   out: {"cmd":"...","ok":false,"error":"..."}
 * </pre>
 * "tick" additionally returns "records": [{"entityId":...,"entityType":...,"record":{...}}, ...]
 * for anything reflected from other federates since the previous tick.
 */
public class StdioBridge
{
    public static void main( String[] args ) throws Exception
    {
        ObjectMapper mapper = new ObjectMapper();
        OrgDoctrineFederate federate = new OrgDoctrineFederate();

        BufferedReader in = new BufferedReader( new InputStreamReader( System.in, StandardCharsets.UTF_8 ) );
        PrintStream out = new PrintStream( System.out, true, StandardCharsets.UTF_8 );

        String line;
        while( ( line = in.readLine() ) != null )
        {
            if( line.isBlank() )
                continue;

            ObjectNode response = mapper.createObjectNode();
            try
            {
                JsonNode request = mapper.readTree( line );
                String cmd = request.path( "cmd" ).asText( null );
                if( cmd == null )
                    throw new IllegalArgumentException( "missing \"cmd\" field" );
                response.put( "cmd", cmd );

                switch( cmd )
                {
                    case "connect" ->
                    {
                        federate.connect( requireText( request, "federationName" ),
                                           requireText( request, "federateName" ) );
                    }
                    case "publish" ->
                    {
                        JsonNode record = request.path( "record" );
                        if( record.isMissingNode() )
                            throw new IllegalArgumentException( "missing \"record\" field" );
                        federate.publish( requireText( request, "entityType" ),
                                           requireText( request, "entityId" ),
                                           mapper.writeValueAsString( record ) );
                    }
                    case "subscribe" -> federate.subscribe();
                    case "tick" ->
                    {
                        double timeoutSeconds = request.path( "timeoutSeconds" ).asDouble( 0.5 );
                        List<OrgDoctrineRecord> records = federate.tick( timeoutSeconds );
                        ArrayNode recordsNode = response.putArray( "records" );
                        for( OrgDoctrineRecord record : records )
                        {
                            ObjectNode recordNode = recordsNode.addObject();
                            recordNode.put( "entityId", record.entityId() );
                            recordNode.put( "entityType", record.entityType() );
                            recordNode.set( "record", mapper.readTree( record.recordJson() ) );
                        }
                    }
                    case "resign" -> federate.resign();
                    default -> throw new IllegalArgumentException( "unknown cmd: " + cmd );
                }

                response.put( "ok", true );
            }
            catch( Exception e )
            {
                response.put( "ok", false );
                response.put( "error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName() );
            }

            out.println( mapper.writeValueAsString( response ) );
        }
    }

    private static String requireText( JsonNode request, String field )
    {
        JsonNode value = request.path( field );
        if( !value.isTextual() )
            throw new IllegalArgumentException( "missing or non-string \"" + field + "\" field" );
        return value.asText();
    }
}
