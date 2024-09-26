import LoginForm from "./form";

export default async function LoginPage(){
    return <div className="flex justify-center items-center">
        <div className="max-w-96">
            <LoginForm/>
        </div>
    </div>
}