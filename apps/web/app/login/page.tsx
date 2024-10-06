import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "./_components";

const LoginPage: React.FC = () => {
  return (
    <AuthLayout variant="login">
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
