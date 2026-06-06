const rbacRoles = [
  { id: 11, key: "fasilitator", label: "Fasilitator" }
];
const role = {
  value: "fasilitator",
  label: "Fasilitator"
};

const rbacRole = rbacRoles.find(r => r.key === role.value);
console.log(rbacRole ? { ...role, id: rbacRole.id || rbacRole.ID } : "not found");
