// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START datacatalog_search_org]
// This application demonstrates how to perform search operations with the
// Cloud Data Catalog API.

const main = async (
  organizationId = process.env.GCLOUD_ORGANIZATION,
  query
) => {

  // -------------------------------
  // Import required modules.
  // -------------------------------
  const { DataCatalogClient } = require('@google-cloud/datacatalog').v1;
  const datacatalog = new DataCatalogClient();

  // Create request.
  const scope = {
    includeOrgIds: [organizationId],
    // Alternatively, search using project scopes.
    // includeProjectIds: ['my-project'],
  };

  const request = {
    scope: scope,
    query: query,
  };

  const [response] = await datacatalog.searchCatalog(request);
  console.log(response);
  return response;
}

// node searchCatalogOrg.js <organizationId> <query>
// sample values:
// organizationId = 111111000000;
// query = 'type=dataset'
main(...process.argv.slice(2));
// [END datacatalog_search_org]
