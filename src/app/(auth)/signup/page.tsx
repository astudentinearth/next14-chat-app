import Link from "next/link";
import SignupForm from "./form";

export default async function SignupPage(){
    return <div className="flex justify-center items-center border-border border p-8 rounded-2xl bg-neutral-900/50">
        <div className="max-w-96 flex flex-col gap-4">
            <SignupForm/>
            <span className="opacity-85">
            Already have an account? <Link href={"/login"} className=" text-blue-600 hover:underline hover:text-blue-500">Sign in</Link>
            </span>
        </div>
    </div>
}