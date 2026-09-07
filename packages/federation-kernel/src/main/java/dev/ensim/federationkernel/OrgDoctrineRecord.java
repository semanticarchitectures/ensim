package dev.ensim.federationkernel;

/**
 * One org-doctrine-model record as federated over HLA: entityId/entityType identify it,
 * recordJson is its full JSON payload (schema owned by packages/org-doctrine-model/schema,
 * not by this class — see standards/hla-fom/org-doctrine-model.xml).
 */
public record OrgDoctrineRecord(String entityId, String entityType, String recordJson)
{
}
