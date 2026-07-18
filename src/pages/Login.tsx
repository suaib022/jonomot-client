import React from 'react';
import type { FormProps } from 'antd';
import { Button, Form, Input } from 'antd';
import { useLoginMutation } from '../redux/features/auth/authApi';
import { useAppDispatch } from '../redux/hooks';
import { setUser } from '../redux/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import collage from '../assets/images/collage.png';
import LogoIcon from '../assets/logo/logo-icon';

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

const Login: React.FC = () => {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    try {
      const res = await login(values).unwrap();

      const user = res?.data?.user || res?.user;
      const token = res?.data?.accessToken || res?.data?.token || res?.accessToken || res?.token;

      if (user && token) {
        dispatch(setUser({ user, token }));
        toast.success(res?.message || 'Logged in successfully!');
        navigate('/');
      } else {
        console.log('Success (mock):', values);
        toast.success('Login form submitted (backend not connected)');
      }
    } catch (err: any) {
      console.log('Failed:', err);
      toast.error(err?.data?.message || 'Failed to login');
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 xl:pr-32">
        <div className="max-w-[550px] w-full mx-auto lg:ml-auto lg:mr-0">
          {/* Logo */}
          <div className="mb-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <LogoIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">Jonomot</span>
          </div>

          {/* Collage */}
          <div className="relative mb-10 -ml-4 md:-ml-8 lg:-ml-12 scale-105">
            <img src={collage} alt="Collage" className="w-full h-auto object-contain drop-shadow-xl hover:scale-[1.02] transition-transform duration-500 ease-out" />
          </div>

          <h2 className="text-[42px] sm:text-[54px] font-extrabold text-gray-900 leading-[1.05] tracking-tight">
            Explore <br className="hidden sm:block" />
            the things <br className="hidden sm:block" />
            <span className="text-primary">you love.</span>
          </h2>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 bg-white lg:border-l lg:border-gray-100">
        <div className="w-full max-w-[396px] lg:-ml-16">
          <h3 className="text-[18px] font-bold mb-5 text-gray-900">Log in to Jonomot</h3>

          {/* Login Card */}
          <div className="bg-white rounded-[10px] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] p-4 border border-gray-100 w-full">
            <Form
              name="basic"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item<FieldType>
                name="email"
                rules={[{ required: true, message: 'Please input your email address!' }]}
                className="mb-3"
              >
                <Input
                  size="large"
                  placeholder="Email address or mobile number"
                  autoComplete="username"
                  className="h-[52px] text-[17px] rounded-[6px] px-4 border-gray-300 hover:border-primary focus:border-primary"
                />
              </Form.Item>

              <Form.Item<FieldType>
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
                className="mb-4"
              >
                <Input.Password
                  size="large"
                  placeholder="Password"
                  autoComplete="current-password"
                  className="h-[52px] text-[17px] rounded-[6px] px-4 border-gray-300 hover:border-primary focus:border-primary"
                />
              </Form.Item>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  className="w-full h-[48px] text-[20px] font-bold rounded-[6px] bg-primary hover:!bg-primary-dark shadow-none border-none transition-colors"
                >
                  Log in
                </Button>
              </Form.Item>

              {/* <div className="text-center mb-5 mt-1">
                <a href="#" className="text-primary text-[14px] font-medium hover:underline">
                  Forgotten password?
                </a>
              </div> */}

              <div className="border-b border-gray-200 mb-6 mx-2"></div>

              <div className="text-center mb-2">
                <Button
                  onClick={() => navigate('/register')}
                  className="h-[48px] px-6 text-[17px] font-bold text-primary border-primary hover:!bg-blue-50 rounded-[6px] shadow-none transition-colors"
                >
                  Create new account
                </Button>
              </div>
            </Form>
          </div>

          <div className="mt-8 flex justify-center items-center gap-2 text-[13px] text-gray-500 font-medium">
            <LogoIcon className="w-5 h-5 opacity-40 text-gray-500" />
            <span>Jonomot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
