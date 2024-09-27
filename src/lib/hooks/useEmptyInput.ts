import { RefObject, useEffect, useState } from "react";

export default function useEmptyInput(input: RefObject<HTMLInputElement>){
    const [empty, setEmpty] = useState(true);
    const check = ()=>{
        if(input.current?.value.trim()==="") setEmpty(true);
        else setEmpty(false);
    }
    useEffect(()=>{
        const current = input.current;
        input.current?.addEventListener("input", check);
        return ()=> current?.removeEventListener("input", check);
    }, [input])
    return {isEmpty: empty}
}