import { supabase } from '../lib/supabase';
import { Employee } from '../types/hrm';

// Helper: Chuyển đổi dữ liệu từ Supabase (snake_case) sang ứng dụng (camelCase)
export const parseSupabaseEmployee = (row: any): Employee => {
  return {
    id: row.id,
    tenantId: 'TENANT-ASIAFOODS', // Sửa lại đúng Tenant ID đang dùng
    code: row.code || '',
    fullName: row.full_name || '',
    gender: row.gender || 'OTHER',
    dob: row.dob || '',
    phone: row.phone || '',
    email: row.email || '',
    cccd: row.cccd || '',
    address: row.address || '',
    departmentName: row.department_name || '',
    position: row.position || '',
    status: row.status || 'PROBATION',
    contractType: row.contract_type || 'PROBATION',
    baseSalary: Number(row.base_salary) || 0,
    
    // Các trường bắt buộc khác của Employee (mock tạm để type không báo lỗi)
    branchId: 'B1',
    branchName: 'Chi nhánh chính',
    departmentId: 'D1',
    role: 'EMPLOYEE',
    contractNumber: '',
    joinDate: new Date().toISOString().split('T')[0],
    contractStartDate: new Date().toISOString().split('T')[0],
    bankAccountNumber: '',
    bankName: '',
    taxCode: '',
    socialInsuranceNumber: '',
    numberOfDependents: 0,
    positionSalary: 0,
    lunchAllowance: 0,
    transportAllowance: 0,
    phoneAllowance: 0,
    toxicTier: 0,
    annualLeaveTotal: 12,
    annualLeaveUsed: 0,
    annualLeaveCarriedOver: 0,
    cccdDate: '',
    cccdPlace: ''
  };
};

export const fetchEmployeesFromSupabase = async (): Promise<Employee[]> => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi tải nhân viên từ Supabase:', error);
    return [];
  }

  if (!data) return [];
  return data.map(parseSupabaseEmployee);
};

export const insertEmployeeToSupabase = async (emp: Employee): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from('employees')
    .insert([
      {
        code: emp.code,
        full_name: emp.fullName,
        gender: emp.gender,
        dob: emp.dob || null,
        phone: emp.phone,
        email: emp.email,
        cccd: emp.cccd,
        address: emp.address,
        department_name: emp.departmentName,
        position: emp.position,
        status: emp.status,
        contract_type: emp.contractType,
        base_salary: emp.baseSalary
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Lỗi thêm nhân viên vào Supabase:', error);
    return null;
  }

  return parseSupabaseEmployee(data);
};

export const insertMultipleEmployees = async (emps: Employee[]): Promise<boolean> => {
  const payload = emps.map(emp => ({
    code: emp.code,
    full_name: emp.fullName,
    gender: emp.gender,
    dob: emp.dob || null,
    phone: emp.phone,
    email: emp.email,
    cccd: emp.cccd,
    address: emp.address,
    department_name: emp.departmentName,
    position: emp.position,
    status: emp.status,
    contract_type: emp.contractType,
    base_salary: emp.baseSalary
  }));

  const { error } = await supabase.from('employees').insert(payload);
  if (error) {
    console.error('Lỗi đẩy dữ liệu hàng loạt:', error);
    return false;
  }
  return true;
};
