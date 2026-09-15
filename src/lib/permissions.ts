export type Role = 'owner' | 'admin' | 'manager' | 'accountant' | 'sales' | 'staff';

export interface Permissions {
  manage_users: boolean;
  manage_shop_settings: boolean;
  create_invoice: boolean;
  manage_inventory: boolean;
  view_reports: boolean;
  manage_customers: boolean;
  delete_records: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, Permissions> = {
  owner: {
    manage_users: true,
    manage_shop_settings: true,
    create_invoice: true,
    manage_inventory: true,
    view_reports: true,
    manage_customers: true,
    delete_records: true,
  },
  admin: {
    manage_users: true,
    manage_shop_settings: false,
    create_invoice: true,
    manage_inventory: true,
    view_reports: true,
    manage_customers: true,
    delete_records: true,
  },
  manager: {
    manage_users: false,
    manage_shop_settings: false,
    create_invoice: true,
    manage_inventory: true,
    view_reports: true,
    manage_customers: true,
    delete_records: false,
  },
  accountant: {
    manage_users: false,
    manage_shop_settings: false,
    create_invoice: false,
    manage_inventory: false,
    view_reports: true,
    manage_customers: false,
    delete_records: false,
  },
  sales: {
    manage_users: false,
    manage_shop_settings: false,
    create_invoice: true,
    manage_inventory: false,
    view_reports: false,
    manage_customers: true,
    delete_records: false,
  },
  staff: {
    manage_users: false,
    manage_shop_settings: false,
    create_invoice: false,
    manage_inventory: false,
    view_reports: false,
    manage_customers: false,
    delete_records: false,
  }
};

export const can = (userRole: string | undefined, action: keyof Permissions): boolean => {
  if (!userRole) return false;
  const role = userRole.toLowerCase() as Role;
  if (!ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role][action];
};
