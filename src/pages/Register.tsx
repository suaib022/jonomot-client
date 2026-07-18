import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input, Select } from 'antd';
import { useRegisterMutation } from '../redux/features/auth/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

type FieldType = {
  first_name?: string;
  last_name?: string;
  dob_day?: string;
  dob_month?: string;
  dob_year?: string;
  gender?: string;
  email?: string;
  username?: string;
  password?: string;
};

const Register: React.FC = () => {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();

  const days = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  const months = [
    { value: '01', label: 'Jan' }, { value: '02', label: 'Feb' }, { value: '03', label: 'Mar' },
    { value: '04', label: 'Apr' }, { value: '05', label: 'May' }, { value: '06', label: 'Jun' },
    { value: '07', label: 'Jul' }, { value: '08', label: 'Aug' }, { value: '09', label: 'Sep' },
    { value: '10', label: 'Oct' }, { value: '11', label: 'Nov' }, { value: '12', label: 'Dec' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) }));

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const dob = values.dob_year && values.dob_month && values.dob_day 
        ? `${values.dob_year}-${values.dob_month.padStart(2, '0')}-${values.dob_day.padStart(2, '0')}` 
        : undefined;

      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username || values.email?.split('@')[0] || 'user' + Math.floor(Math.random() * 1000),
        email: values.email,
        password: values.password,
        gender: values.gender,
        date_of_birth: dob,
      };
      
      const res = await registerUser(payload).unwrap();
      toast.success(res?.message || 'Registration successful! Please log in.');
      navigate('/login');
    } catch (err: any) {
      console.log('Failed:', err);
      toast.error(err?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10 pb-20 font-sans">
      <div className="w-full max-w-[432px] px-4">
        
        <h1 className="text-[28px] font-bold text-[#1c1e21] mb-2 leading-tight">
          Get started on Jonomot
        </h1>
        <p className="text-[#606770] text-[15px] mb-6 leading-5">
          Create an account to connect with friends, family and communities of people who share your interests.
        </p>

        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          className="w-full"
        >
          {/* Name Section */}
          <div className="mb-1">
            <span className="text-[15px] font-semibold text-[#1c1e21] block mb-2">Name</span>
            <div className="flex gap-3">
              <Form.Item<FieldType>
                name="first_name"
                rules={[{ required: true, message: 'First name required' }]}
                className="flex-1 mb-4"
              >
                <Input 
                  size="large" 
                  placeholder="First name" 
                  className="h-[40px] text-[15px] rounded-[6px] px-3 border-[#ccd0d5] bg-[#f5f6f7] hover:border-[#ccd0d5] focus:border-[#1877f2] focus:bg-white" 
                />
              </Form.Item>
              <Form.Item<FieldType>
                name="last_name"
                rules={[{ required: true, message: 'Surname required' }]}
                className="flex-1 mb-4"
              >
                <Input 
                  size="large" 
                  placeholder="Surname" 
                  className="h-[40px] text-[15px] rounded-[6px] px-3 border-[#ccd0d5] bg-[#f5f6f7] hover:border-[#ccd0d5] focus:border-[#1877f2] focus:bg-white" 
                />
              </Form.Item>
            </div>
          </div>

          {/* DOB Section */}
          <div className="mb-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[15px] font-semibold text-[#1c1e21]">Date of birth</span>
              <svg className="w-[14px] h-[14px] text-[#606770]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div className="flex gap-3">
              <Form.Item<FieldType> name="dob_day" className="flex-1 mb-4" initialValue={days[0].value}>
                <Select options={days} className="h-[40px]" />
              </Form.Item>
              <Form.Item<FieldType> name="dob_month" className="flex-1 mb-4" initialValue={months[0].value}>
                <Select options={months} className="h-[40px]" />
              </Form.Item>
              <Form.Item<FieldType> name="dob_year" className="flex-1 mb-4" initialValue={years[0].value}>
                <Select options={years} className="h-[40px]" />
              </Form.Item>
            </div>
          </div>

          {/* Gender Section */}
          <div className="mb-1">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-[15px] font-semibold text-[#1c1e21]">Gender</span>
              <svg className="w-[14px] h-[14px] text-[#606770]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <Form.Item<FieldType> name="gender" className="mb-4" initialValue="Male">
              <Select 
                options={[{value: 'Male', label: 'Male'}, {value: 'Female', label: 'Female'}, {value: 'Custom', label: 'Custom'}]} 
                className="h-[40px] w-full" 
              />
            </Form.Item>
          </div>

          {/* Email / Username */}
          <div className="mb-1">
            <span className="text-[15px] font-semibold text-[#1c1e21] block mb-2">Email address</span>
            <Form.Item<FieldType>
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
              className="mb-1"
            >
              <Input 
                size="large" 
                placeholder="Email address" 
                autoComplete="email"
                className="h-[40px] text-[15px] rounded-[6px] px-3 border-[#ccd0d5] bg-[#f5f6f7] hover:border-[#ccd0d5] focus:border-[#1877f2] focus:bg-white" 
              />
            </Form.Item>
            <p className="text-[11px] text-[#606770] mb-4">
              You may receive notifications from us. <a href="#" className="text-[#1877f2] hover:underline">Learn why we ask for your contact information</a>
            </p>
          </div>

          {/* Username */}
          <div className="mb-1">
            <span className="text-[15px] font-semibold text-[#1c1e21] block mb-2">Username</span>
            <Form.Item<FieldType>
              name="username"
              rules={[{ required: true, message: 'Username required' }]}
              className="mb-4"
            >
              <Input 
                size="large" 
                placeholder="Username" 
                autoComplete="username"
                className="h-[40px] text-[15px] rounded-[6px] px-3 border-[#ccd0d5] bg-[#f5f6f7] hover:border-[#ccd0d5] focus:border-[#1877f2] focus:bg-white" 
              />
            </Form.Item>
          </div>

          {/* Password */}
          <div className="mb-1">
            <span className="text-[15px] font-semibold text-[#1c1e21] block mb-2">Password</span>
            <Form.Item<FieldType>
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              className="mb-4"
            >
              <Input.Password 
                size="large" 
                placeholder="Password" 
                autoComplete="new-password"
                className="h-[40px] text-[15px] rounded-[6px] px-3 border-[#ccd0d5] bg-[#f5f6f7] hover:border-[#ccd0d5] focus:border-[#1877f2] focus:bg-white" 
              />
            </Form.Item>
          </div>

          <div className="text-[12px] text-[#606770] mb-5 leading-relaxed">
            <p className="mb-2">People who use our service may have uploaded your contact information to Jonomot. <a href="#" className="text-[#1877f2] hover:underline">Learn more</a>.</p>
            <p>By tapping Submit, you agree to create an account and to Jonomot's <a href="#" className="text-[#1877f2] hover:underline">Terms</a>, <a href="#" className="text-[#1877f2] hover:underline">Privacy Policy</a> and <a href="#" className="text-[#1877f2] hover:underline">Cookies Policy</a>.</p>
          </div>

          <div className="flex justify-center mt-2 mb-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isLoading}
              className="w-full h-[40px] text-[17px] font-bold rounded-[6px] bg-[#1877f2] hover:!bg-[#166fe5] shadow-none border-none transition-colors"
            >
              Submit
            </Button>
          </div>
          
          <div className="text-center">
            <Link to="/login" className="text-[#1877f2] text-[15px] font-medium hover:underline">
              Already have an account?
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
