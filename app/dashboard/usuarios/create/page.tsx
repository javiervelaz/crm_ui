'use client'
import CreateUserForm from '@/app/dashboard/usuarios/components/CreateUserForm';
import useAuthCheck from '@/app/lib/useAuthCheck';

const CreateUserPage = () => {
  useAuthCheck();
  return (
    <div className="w-full p-6">
      <CreateUserForm />
    </div>
  );
};

export default CreateUserPage;
