import { redirect } from "next/navigation";

type SearchParams = { [key: string]: string | string[] | undefined };

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const token =
    (searchParams?.token as string | undefined) ||
    (searchParams?.access_token as string | undefined);

  if (token) {
    redirect(/auth/reset-password/${token});
  }

  redirect("/auth/reset-password");
}