import { PageHeader } from "../../components/ui";
import {
  createDepartment,
  createDesignation,
  deleteDepartment,
  deleteDesignation,
  listDepartments,
  listDesignations,
  updateDepartment,
  updateDesignation,
} from "../../features/organization/api";
import { NameCatalog } from "./organization/NameCatalog";

export function AdminOrganizationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Departments & Designations"
        description="Names HR picks when registering an employee. Delete is refused when a person still uses the name."
      />
      <NameCatalog
        title="Departments"
        noun="department"
        list={listDepartments}
        create={createDepartment}
        update={updateDepartment}
        remove={deleteDepartment}
      />
      <NameCatalog
        title="Designations"
        noun="designation"
        list={listDesignations}
        create={createDesignation}
        update={updateDesignation}
        remove={deleteDesignation}
      />
    </div>
  );
}
