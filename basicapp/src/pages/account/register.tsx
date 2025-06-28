import AnimatedContainer from "@/components/animatedContainter";
import ErrorDisplay from "@/components/errorDisplay";
import SimpleTextInput from "@/components/simpleTextInput";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { FieldError } from "@/interfaces/interfaces";
import { registerSchema } from "@/schemas/accounts.schema";
import { joiResolver } from "@hookform/resolvers/joi";
import { LoaderCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

export default function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    resetField
  } = useForm({
    resolver: joiResolver(registerSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const {showToast} = useToast();

  const { handleRegister } = useAuth();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await handleRegister(data.email, data.password, data.name);
    console.log(result);
    if (result.statusCode === 200) {
      showToast("Cuenta creada con éxito", 'success');
      navigate("/login");
    } else {
      showToast(result.responseData.message ?? "Error al crear la cuenta", "error");
      if (result.responseData.fieldErrors) {
        result.responseData.fieldErrors.forEach((error : FieldError) => {
          setError(error.field, {
            type: "manual",
            message: error.message,
          });
        });
      }
    }
    setIsLoading(false);
  };

  return (
    <AnimatedContainer>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center justify-center my-10 px-4 md:min-w-1/4 py-12 sm:px-6 lg:px-8 bg-zinc-100 dark:bg-zinc-800 shadow-2xl"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <UserPlus className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
              Registra tu cuenta
            </h2>
          </div>
          <div className="flex flex-col space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-500">
              Ingresa los datos necesarios para crear una cuenta
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <SimpleTextInput
              label="Nombre de usuario"
              isValid={!errors.name}
              onClear={() => resetField("name")}
              {...register("name")}
              {...{ autoComplete: "username" }}
            />
            {errors.name && (
              <ErrorDisplay message={errors.name.message as string} />
            )}
            <SimpleTextInput
              label="Correo electrónico"
              isValid={!errors.email}
              onClear={() => resetField("email")}
              {...register("email")}
              {...{ autoComplete: "email" }}
            />
            {errors.email && (
              <ErrorDisplay message={errors.email.message as string} />
            )}
            <SimpleTextInput
              label="Contraseña"
              isValid={!errors.password}
              onClear={() => resetField("password")}
              type="password"
              {...register("password")}
              {...{ autoComplete: "new-password" }}
            />
            {errors.password && (
              <ErrorDisplay message={errors.password.message as string} />
            )}
            <SimpleTextInput
              label="Confirmar contraseña"
              isValid={!errors.confirmPassword}
              onClear={() => resetField("confirmPassword")}
              type="password"
              {...register("confirmPassword")}
              {...{ autoComplete: "new-password" }}
            />
            {errors.confirmPassword && (
              <ErrorDisplay message={errors.confirmPassword.message as string} />
            )}
            <div className="flex items-center justify-start">
              <p className="mt-2 text-sm text-zinc-400">
                Ya tienes una cuenta?{" "}
                <a
                  href="/login"
                  className="font-medium text-red-400 hover:text-red-300 transition-colors"
                >
                  Inicia sesión aquí
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex flex-row h-12 justify-center items-center gap-x-2 bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-90 text-white font-medium disabled:bg-red-300 transition-all"
            >
              {isLoading && <LoaderCircle className="animate-spin" size={24} />}
              Registrarse
            </button>
          </div>
        </div>
      </form>
    </AnimatedContainer>
  );
}
