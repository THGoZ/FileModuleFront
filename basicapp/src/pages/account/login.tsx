import { useState } from "react";
import { LoaderCircle, Lock } from "lucide-react";
import SimpleTextInput from "../../components/simpleTextInput";
import AnimatedContainer from "../../components/animatedContainter";
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { loginSchema } from "@/schemas/accounts.schema";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: joiResolver(loginSchema),
  });

  const [isLoading, setIsLoading] = useState(false);
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const result = await handleLogin(data.email, data.password);

    if (result) {
      navigate("/dashboard");
    } else {
      window.alert("Usuario o contraseña incorrectos");
    }
    setIsLoading(false);
  };

  return (
    <AnimatedContainer>
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-100 dark:bg-zinc-800 shadow-2xl">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200">
              Inicia sesion a tu cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-500">
              o{" "}
              <a
                href="/register"
                className="font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
              >
                crea una nueva cuenta
              </a>
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <p className="text-center text-sm text-gray-600 dark:text-gray-500">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-4">
              <SimpleTextInput
                label="Correo electronico"
                {...register("email")}
                {...{ autoComplete: "email" }}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message as string}</p>
              )}
              <SimpleTextInput
                label="Contraseña"
                isPassword={true}
                {...register("password")}
                {...{ autoComplete: "current-password" }}
              />
              {errors.email && (
                <p className="text-red-500">{errors.email.message as string}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={`${rememberMe ? "bg-red-600" : ""}`}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-200"
                  >
                    Recuerdame
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors"
                >
                  Olvidaste tu contraseña?
                </a>
              </div>
            </div>
            <div className="flex flex-col space-y-4 pt-4">
              <button
                type="submit"
                className="w-full flex flex-row h-12 justify-center items-center gap-x-2 bg-red-600 hover:bg-red-500 hover:scale-105 active:scale-90 text-white font-medium disabled:bg-red-300 transition-all"
              >
                {isLoading && (
                  <LoaderCircle className="animate-spin" size={24} />
                )}
                Iniciar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </AnimatedContainer>
  );
}
