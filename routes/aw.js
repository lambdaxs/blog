/**
 * Created by xiaos on 16/11/10.
 */

let fn = (tag)=>{
    return new Promise((s,f)=>{
        setTimeout(()=>{
            if(tag){
                s("fuck")
            }else {
                f(new Error("err"))
            }
        },3000)
    })
}


try {
    (async ()=>{
        const rs = await fn()
        console.log(rs)
        console.log("hello")
    })()
}catch(err) {
    console.log(err)
}


