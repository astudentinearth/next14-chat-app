import SignupForm from "./form";

export default async function SignupPage(){
    return <div className="flex justify-center items-center h-full w-full absolute">
        <div>
            <SignupForm/>
        </div>
    </div>
}