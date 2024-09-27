"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/auth/auth.actions"
import { LoginSchema, LoginSchemaType } from "@/lib/auth/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function LoginForm(){
    const {register, handleSubmit, formState: {errors}} = useForm<LoginSchemaType>({resolver: zodResolver(LoginSchema)})
    const submit = async (data: LoginSchemaType)=>{
        login(data.username, data.password);
    }
    return <form className="flex flex-col gap-1 [&>input]:text-xl" onSubmit={handleSubmit(submit)}>
        <h1 className="font-medium text-3xl mb-2">Sign in</h1>
        <Input {...register("username")} placeholder="Username"/>
        <p>{errors.username?.message}</p>
        <Input {...register("password")} placeholder="Password" type="password"/>
        <p>{errors.password?.message}</p>
        <Button variant={"default"} type="submit" className="text-xl">Sign in</Button>
    </form>
}