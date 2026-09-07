package dev.ensim.federationkernel;

import hla.rti1516e.AttributeHandle;
import hla.rti1516e.AttributeHandleSet;
import hla.rti1516e.AttributeHandleValueMap;
import hla.rti1516e.CallbackModel;
import hla.rti1516e.ObjectClassHandle;
import hla.rti1516e.ObjectInstanceHandle;
import hla.rti1516e.RTIambassador;
import hla.rti1516e.ResignAction;
import hla.rti1516e.RtiFactoryFactory;
import hla.rti1516e.exceptions.FederatesCurrentlyJoined;
import hla.rti1516e.exceptions.FederationExecutionAlreadyExists;
import hla.rti1516e.exceptions.FederationExecutionDoesNotExist;

import java.io.File;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal HLA federate joining the org-doctrine-model federation (standards/hla-fom/org-doctrine-model.xml)
 * and publishing/subscribing Record object instances. Deliberately does not implement time
 * management or synchronization points - Mission 1 v1 is a discrete-event simulation run by
 * sim-services, not this federate (ARCHITECTURE.md Section 4a/7); this federate's only job is
 * getting org-doctrine-model records in and out of the HLA federation.
 *
 * Uses CallbackModel.HLA_EVOKED so callbacks only fire inside {@link #tick}, never on a
 * background thread - keeps the stdio bridge single-threaded.
 */
public class OrgDoctrineFederate
{
    private static final String RECORD_CLASS_NAME = "HLAobjectRoot.OrgDoctrineModel.Record";

    private RTIambassador rtiamb;
    private OrgDoctrineFederateAmbassador fedamb;

    private ObjectClassHandle recordClassHandle;
    private AttributeHandle entityIdHandle;
    private AttributeHandle entityTypeHandle;
    private AttributeHandle recordJsonHandle;
    private AttributeHandleSet allAttributes;

    private final Map<String, ObjectInstanceHandle> publishedInstances = new HashMap<>();
    private String federationName;

    public void connect( String federationName, String federateName ) throws Exception
    {
        this.federationName = federationName;

        rtiamb = RtiFactoryFactory.getRtiFactory().getRtiAmbassador();

        URL fomUrl = fomModuleUrl();

        fedamb = new OrgDoctrineFederateAmbassador( this );
        rtiamb.connect( fedamb, CallbackModel.HLA_EVOKED );

        try
        {
            rtiamb.createFederationExecution( federationName, new URL[] { fomUrl } );
        }
        catch( FederationExecutionAlreadyExists ignored )
        {
            // Another federate already created it - expected in a multi-federate run.
        }

        // Deliberately no FOM modules on join: the federation already has org-doctrine-model.xml
        // loaded from createFederationExecution above, and this federate never extends it with
        // an additional module. Re-supplying the same module here trips a bug in Portico's
        // JGroups coordinator (Manifest.federateJoined throws NullPointerException trying to
        // merge a joining federate's module list against the federation's base FOM when they're
        // identical) - confirmed empirically against portico-2.1.4.
        rtiamb.joinFederationExecution( federateName, "OrgDoctrineFederate", federationName );

        recordClassHandle = rtiamb.getObjectClassHandle( RECORD_CLASS_NAME );
        entityIdHandle = rtiamb.getAttributeHandle( recordClassHandle, "EntityId" );
        entityTypeHandle = rtiamb.getAttributeHandle( recordClassHandle, "EntityType" );
        recordJsonHandle = rtiamb.getAttributeHandle( recordClassHandle, "RecordJson" );

        allAttributes = rtiamb.getAttributeHandleSetFactory().create();
        allAttributes.add( entityIdHandle );
        allAttributes.add( entityTypeHandle );
        allAttributes.add( recordJsonHandle );

        rtiamb.publishObjectClassAttributes( recordClassHandle, allAttributes );
    }

    private URL fomModuleUrl() throws Exception
    {
        String override = System.getProperty( "ensim.fom.path" );
        Path fomPath = override != null ? Path.of( override ) : defaultFomPath();
        return new File( fomPath.toString() ).toURI().toURL();
    }

    private Path defaultFomPath()
    {
        // packages/federation-kernel -> ../../standards/hla-fom/org-doctrine-model.xml
        return Path.of( "..", "..", "standards", "hla-fom", "org-doctrine-model.xml" ).normalize();
    }

    public void publish( String entityType, String entityId, String recordJson ) throws Exception
    {
        ObjectInstanceHandle instance = publishedInstances.get( entityId );
        if( instance == null )
        {
            instance = rtiamb.registerObjectInstance( recordClassHandle );
            publishedInstances.put( entityId, instance );
        }

        AttributeHandleValueMap attributes = rtiamb.getAttributeHandleValueMapFactory().create( 3 );
        attributes.put( entityIdHandle, encodeString( entityId ) );
        attributes.put( entityTypeHandle, encodeString( entityType ) );
        attributes.put( recordJsonHandle, encodeString( recordJson ) );

        rtiamb.updateAttributeValues( instance, attributes, ( "publish:" + entityId ).getBytes() );
    }

    public void subscribe() throws Exception
    {
        rtiamb.subscribeObjectClassAttributes( recordClassHandle, allAttributes );
    }

    /**
     * Drains any RTI callbacks received since the last tick (bounded by timeoutSeconds) and
     * returns the org-doctrine-model records reflected from other federates during that window.
     */
    public List<OrgDoctrineRecord> tick( double timeoutSeconds ) throws Exception
    {
        rtiamb.evokeMultipleCallbacks( 0.0, timeoutSeconds );
        List<OrgDoctrineRecord> drained = new ArrayList<>();
        OrgDoctrineRecord record;
        while( ( record = fedamb.reflectedRecords.poll() ) != null )
        {
            drained.add( record );
        }
        return drained;
    }

    public void resign() throws Exception
    {
        rtiamb.resignFederationExecution( ResignAction.DELETE_OBJECTS );
        try
        {
            rtiamb.destroyFederationExecution( federationName );
        }
        catch( FederationExecutionDoesNotExist | FederatesCurrentlyJoined ignored )
        {
            // Expected when other federates remain, or someone else already destroyed it.
        }
        rtiamb.disconnect();
    }

    /**
     * Plain UTF-8, not Portico's HLAunicodeString encoder - see OrgDoctrineFederateAmbassador's
     * class javadoc for why (a confirmed Portico 2.1.4 bug, not a design choice made lightly).
     */
    static byte[] encodeString( String value )
    {
        return value.getBytes( StandardCharsets.UTF_8 );
    }

    static String decodeString( byte[] bytes )
    {
        return new String( bytes, StandardCharsets.UTF_8 );
    }

    // Package-private accessors for OrgDoctrineFederateAmbassador, which needs these handles
    // to decode reflects but is constructed (and handed to connect()) before they're resolved.
    AttributeHandle entityIdHandle() { return entityIdHandle; }
    AttributeHandle entityTypeHandle() { return entityTypeHandle; }
    AttributeHandle recordJsonHandle() { return recordJsonHandle; }
}
