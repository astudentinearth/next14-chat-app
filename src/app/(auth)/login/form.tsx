"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoginSchema, LoginSchemaType } from "@/lib/auth/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function LoginForm(){
    const {register, handleSubmit, formState: {errors}} = useForm<LoginSchemaType>({resolver: zodResolver(LoginSchema)})
    return <form className="flex flex-col gap-1">
        <Input {...register("username")} placeholder="Username"/>
        <p>{errors.username?.message}</p>
        <Input {...register("password")} placeholder="Password" type="password"/>
        <p>{errors.password?.message}</p>
        <Button variant={"default"} type="submit">Sign in</Button>
    </form>
}