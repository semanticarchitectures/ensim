package dev.ensim.federationkernel;

import hla.rti1516e.AttributeHandleValueMap;
import hla.rti1516e.LogicalTime;
import hla.rti1516e.NullFederateAmbassador;
import hla.rti1516e.ObjectClassHandle;
import hla.rti1516e.ObjectInstanceHandle;
import hla.rti1516e.OrderType;
import hla.rti1516e.TransportationTypeHandle;
import hla.rti1516e.exceptions.FederateInternalError;

import java.util.concurrent.ConcurrentLinkedQueue;

/**
 * Handles RTI callbacks for the Record object class (see standards/hla-fom/org-doctrine-model.xml).
 * Reads attribute handles lazily from the owning {@link OrgDoctrineFederate} at callback time
 * (via the outer-instance reference, same pattern Portico's own ExampleFederateAmbassador uses)
 * because those handles aren't resolved until after joinFederationExecution, which happens after
 * this ambassador must already be constructed and passed to connect().
 *
 * String attributes are decoded as plain UTF-8 (see OrgDoctrineFederate#encodeString) rather than
 * via Portico's HLAunicodeString encoder/decoder, which is broken in portico-2.1.4 - confirmed by
 * EncodingRoundTripTest that even a pure in-process encode-then-decode with no federation/network
 * involved returns an empty string. Since both ends of this attribute are our own code, an
 * RTI-standard wire format isn't required - only round-trip correctness is.
 *
 * Decoded reflects are pushed onto a queue that {@link OrgDoctrineFederate#tick} drains - kept
 * single-threaded (CallbackModel.HLA_EVOKED) so the stdio bridge never has to reason about
 * concurrent callbacks.
 */
class OrgDoctrineFederateAmbassador extends NullFederateAmbassador
{
    private final OrgDoctrineFederate federate;
    final ConcurrentLinkedQueue<OrgDoctrineRecord> reflectedRecords = new ConcurrentLinkedQueue<>();

    OrgDoctrineFederateAmbassador( OrgDoctrineFederate federate )
    {
        this.federate = federate;
    }

    @Override
    public void discoverObjectInstance( ObjectInstanceHandle theObject,
                                         ObjectClassHandle theObjectClass,
                                         String objectName )
    {
        // No action needed: we don't yet have attribute values, only the instance handle.
        // The first reflectAttributeValues callback for this instance carries the data.
    }

    @Override
    public void reflectAttributeValues( ObjectInstanceHandle theObject,
                                         AttributeHandleValueMap theAttributes,
                                         byte[] tag,
                                         OrderType sentOrdering,
                                         TransportationTypeHandle theTransport,
                                         LogicalTime time,
                                         OrderType receivedOrdering,
                                         SupplementalReflectInfo reflectInfo )
        throws FederateInternalError
    {
        byte[] idBytes = theAttributes.get( federate.entityIdHandle() );
        byte[] typeBytes = theAttributes.get( federate.entityTypeHandle() );
        byte[] jsonBytes = theAttributes.get( federate.recordJsonHandle() );
        if( idBytes == null || typeBytes == null || jsonBytes == null )
        {
            // Partial update (not all three attributes present in this particular
            // reflect) - nothing to build a complete OrgDoctrineRecord from yet.
            return;
        }
        String entityId = OrgDoctrineFederate.decodeString( idBytes );
        String entityType = OrgDoctrineFederate.decodeString( typeBytes );
        String recordJson = OrgDoctrineFederate.decodeString( jsonBytes );
        reflectedRecords.add( new OrgDoctrineRecord( entityId, entityType, recordJson ) );
    }

    @Override
    public void reflectAttributeValues( ObjectInstanceHandle theObject,
                                         AttributeHandleValueMap theAttributes,
                                         byte[] tag,
                                         OrderType sentOrdering,
                                         TransportationTypeHandle theTransport,
                                         SupplementalReflectInfo reflectInfo )
        throws FederateInternalError
    {
        reflectAttributeValues( theObject, theAttributes, tag, sentOrdering, theTransport,
                                 null, sentOrdering, reflectInfo );
    }
}
