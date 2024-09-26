"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SignupSchema, SignupSchemaType } from "@/lib/auth/validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

export default function SignupForm(){
    const {register, handleSubmit, formState: {errors}} = useForm<SignupSchemaType>({resolver: zodResolver(SignupSchema)})
    return <form className="flex flex-col gap-1 [&>input]:text-xl [&>input]:w-96">
        <h1 className="font-medium text-3xl mb-2">Sign up</h1>
        <Input {...register("username")} placeholder="Username"/>
        <p>{errors.username?.message}</p>
        <Input {...register("password")} placeholder="Password" type="password"/>
        <p>{errors.password?.message}</p>
        <Input {...register("confirm_password")} placeholder="Confirm password" type="password"/>
        <p>{errors.password?.message}</p>
        <Button variant={"default"} type="submit" className="text-xl">Sign up</Button>
    </form>
}