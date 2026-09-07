package dev.ensim.federationkernel;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * OrgDoctrineFederate.encodeString/decodeString is plain UTF-8, not Portico's HLAunicodeString
 * encoder - see OrgDoctrineFederateAmbassador's class javadoc for why. This guards that choice
 * against regressing back to the broken Portico path.
 */
class EncodingRoundTripTest
{
    @Test
    void stringRoundTrips()
    {
        String value = "pacaf";
        byte[] encoded = OrgDoctrineFederate.encodeString( value );
        assertEquals( value, OrgDoctrineFederate.decodeString( encoded ) );
    }

    @Test
    void stringRoundTripsWithNonAsciiAndSymbols()
    {
        String value = "{\"id\":\"pacaf\",\"name\":\"Pacific Air Forces — Ü\"}";
        byte[] encoded = OrgDoctrineFederate.encodeString( value );
        assertEquals( value, OrgDoctrineFederate.decodeString( encoded ) );
    }
}
