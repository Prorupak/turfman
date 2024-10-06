"use client";

import { AnimatedSizeContainer } from "@/components/common/AnimatedContainer";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { InputPassword } from "@/components/icons/InputPassword";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { cn } from "@turfman/utils";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export const authMethods = ["email", "saml", "password"] as const;
export type AuthMethod = (typeof authMethods)[number];

const errorCodes = {
  "no-credentials": "Please provide an email and password.",
  "invalid-credentials": "Email or password is incorrect.",
  "exceeded-login-attempts":
    "Account has been locked due to too many login attempts. Please contact support to unlock your account.",
  "too-many-login-attempts": "Too many login attempts. Please try again later.",
};

const LoginFormContext = createContext<{
  authMethod: AuthMethod | undefined;
  setAuthMethod: Dispatch<SetStateAction<AuthMethod | undefined>>;
  clickedMethod: AuthMethod | undefined;
  showPasswordField: boolean;
  setShowPasswordField: Dispatch<SetStateAction<boolean>>;
  setClickedMethod: Dispatch<SetStateAction<AuthMethod | undefined>>;
  setLastUsedAuthMethod: Dispatch<SetStateAction<AuthMethod | undefined>>;
}>({
  authMethod: undefined,
  setAuthMethod: () => {},
  clickedMethod: undefined,
  showPasswordField: false,
  setShowPasswordField: () => {},
  setClickedMethod: () => {},
  setLastUsedAuthMethod: () => {},
});

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [clickedMethod, setClickedMethod] = useState<AuthMethod | undefined>(
    undefined,
  );

  const [lastUsedAuthMethodLive, setLastUsedAuthMethod] = useLocalStorage<any>(
    "last-used-auth-method",
    undefined,
  );
  const { current: lastUsedAuthMethod } = useRef<AuthMethod | undefined>(
    lastUsedAuthMethodLive,
  );

  const [authMethod, setAuthMethod] = useState<AuthMethod | undefined>(
    authMethods.find((m) => m === lastUsedAuthMethodLive) ?? "email",
  );

  useEffect(() => {
    const error = searchParams?.get("error");
    error && toast.error(error);
  }, [searchParams]);

  useEffect(() => {
    // when leave page, reset state
    return () => setClickedMethod(undefined);
  }, []);

  const authProviders = [
    {
      method: "email",
      component: <SignInWithEmail />,
    },
  ];

  const authMethodComponent = authProviders.find(
    (provider) => provider.method === authMethod,
  )?.component;

  const showEmailPasswordOnly = authMethod === "email" && showPasswordField;

  return (
    <LoginFormContext.Provider
      value={{
        authMethod,
        setAuthMethod,
        clickedMethod,
        showPasswordField,
        setShowPasswordField,
        setClickedMethod,
        setLastUsedAuthMethod,
      }}
    >
      <AnimatedSizeContainer height>
        <div className="grid gap-3 p-1">
          {authMethod && (
            <div className="flex flex-col gap-2">
              {authMethodComponent}

              {!showEmailPasswordOnly && authMethod === lastUsedAuthMethod && (
                <div className="text-center text-xs">
                  <span className="text-gray-500">
                    You signed in with{" "}
                    {lastUsedAuthMethod.charAt(0).toUpperCase() +
                      lastUsedAuthMethod.slice(1)}{" "}
                    last time
                  </span>
                </div>
              )}
              {/* <div className="my-2 flex flex-shrink items-center justify-center gap-2">
                <div className="grow basis-0 border-b border-gray-300" />
                <span className="text-xs font-normal uppercase leading-none text-gray-500">
                  or
                </span>
                <div className="grow basis-0 border-b border-gray-300" />
              </div> */}
            </div>
          )}
          {showEmailPasswordOnly ? (
            <div className="mt-2 text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => setShowPasswordField(false)}
                className="font-semibold text-gray-500 transition-colors hover:text-black"
              >
                Continue with another method
              </button>
            </div>
          ) : (
            authProviders
              .filter((provider) => provider.method !== authMethod)
              .map((provider) => (
                <div key={provider.method}>{provider.component}</div>
              ))
          )}
        </div>
      </AnimatedSizeContainer>
    </LoginFormContext.Provider>
  );
};

const SignInWithEmail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const { isMobile } = useMediaQuery();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { showPasswordField, setClickedMethod, clickedMethod } =
    useContext(LoginFormContext);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const provider = "credentials";

        console.log({ email, password });

        signIn(provider, {
          email,
          password,
          redirect: false,
          ...(next ? { callbackUrl: next } : {}),
        });
        //   .then((res) => {
        //   if (!res) return;

        //   // Handle errors
        //   if (!res.ok && res.error) {
        //     if (errorCodes[res.error as keyof typeof errorCodes]) {
        //       toast.error(errorCodes[res.error as keyof typeof errorCodes]);
        //     } else {
        //       toast.error(res.error);
        //     }
        //     setClickedMethod(undefined);

        //     return;
        //   }

        //   router.push(next ?? "/");
        // });
      }}
      className="flex flex-col space-y-3"
    >
      <input
        id="email"
        name="email"
        autoFocus={!isMobile && !showPasswordField}
        type="email"
        placeholder="panic@thedis.co"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={cn(
          "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-black focus:outline-none focus:ring-black sm:text-sm",
        )}
      />

      <div>
        <Input
          type="password"
          autoFocus={!isMobile}
          value={password}
          placeholder="Password"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <Button
        text="Sign in"
        variant="secondary"
        icon={<InputPassword className="size-4 text-gray-600" />}
        type="submit"
        disabled={clickedMethod && clickedMethod !== "email"}
      />
    </form>
  );
};
