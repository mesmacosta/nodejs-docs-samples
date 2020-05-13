/**  
 * This application demonstrates how to grant a project member
 * the Tag Template User role for a given template.

 * For more information, see the README.md under /datacatalog and the
 * documentation at https://cloud.google.com/data-catalog/docs.
*/

const main = async (
    projectId = process.env.GCLOUD_PROJECT,
    tagTemplateId,
    memberId
) => {
    // -------------------------------
    // Import required modules.
    // -------------------------------
    const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;
    const datacatalog = new DataCatalogClient();

    const location = 'us-central1';

    // Format the Template name.
    const templateName = datacatalog.tagTemplatePath(
        projectId,
        location,
        tagTemplateId
    );

    // Retrieve Template's current IAM Policy.
    const [getPolicyResponse] = await datacatalog.getIamPolicy({ resource: templateName });
    const policy = getPolicyResponse;

    // Add Tag Template User role and member to the policy.
    policy.bindings.push({
        role: 'roles/datacatalog.tagTemplateUser',
        members: [memberId],
    });

    const request = {
        resource: templateName,
        policy: policy,
    };

    // Update Template's policy.
    const [updatePolicyResponse] = await datacatalog.setIamPolicy(request);
    console.log(`Iam policy: ${JSON.stringify(updatePolicyResponse)}`);
};

// node grantTagTemplateUserRole.js <projectId> <tagTemplateId> <memberId>
// sample values:
// projectId = 'my-project';
// tagTemplateId = 'my-template';
// memberId = 'user:member@gmail.com';
main(...process.argv.slice(2));
