export const GENDER_OPTIONS = [
  { value: "undisclosed", label: "Undisclosed" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "probation", label: "Probation" },
  { value: "exited", label: "Exited" },
];

export const EMPTY_EMPLOYEE_FORM = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  departmentId: "",
  designationId: "",
  joinDate: "",
  status: "active",
  gender: "undisclosed",
  basicSalary: "",
};

export function employeeToForm(employee) {
  return {
    code: employee?.code || "",
    name: employee?.name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    address: employee?.address || "",
    departmentId: employee?.department?.id || "",
    designationId: employee?.designation?.id || "",
    joinDate: employee?.joinDate || "",
    status: employee?.status || "active",
    gender: employee?.gender || "undisclosed",
    basicSalary: employee?.salary?.basic == null ? "" : String(employee.salary.basic),
  };
}

export function buildEmployeePayload(form) {
  return {
    code: form.code.trim(),
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
    departmentId: form.departmentId,
    designationId: form.designationId,
    joinDate: form.joinDate,
    status: form.status,
    gender: form.gender,
    basicSalary: Number(form.basicSalary),
  };
}

export function validateEmployeeForm(form) {
  const errors = {};
  if (!form.code.trim()) errors.code = "Enter an employee code.";
  if (!form.name.trim()) errors.name = "Enter the name.";
  if (!form.email.trim()) errors.email = "Enter an email.";
  if (!form.departmentId) errors.departmentId = "Choose a department.";
  if (!form.designationId) errors.designationId = "Choose a designation.";
  if (!form.joinDate) errors.joinDate = "Enter the join date.";
  if (!form.basicSalary || Number(form.basicSalary) < 1) errors.basicSalary = "Enter a basic salary greater than 0.";
  return errors;
}
