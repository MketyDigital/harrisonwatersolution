import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.115.0';
const URL='https://vdblajgxrfndjesoyayy.supabase.co';
const KEY='sb_publishable_nATRaQcJJrIiVLm5dyKZOg_owt3cNMQ';
const ADMIN_EMAIL='info@harrisonwatersolution.com';
const supabase=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const $=s=>document.querySelector(s);
const show=(msg,error=false)=>{$('#otpStatus').innerHTML=msg?`<div class="status${error?' error':''}">${String(msg).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</div>`:''};

$('#adminEmail').value=ADMIN_EMAIL;
$('#sendCodeBtn').onclick=async()=>{
  show('Sending secure sign-in email…');
  const {error}=await supabase.auth.signInWithOtp({
    email:ADMIN_EMAIL,
    options:{shouldCreateUser:true,emailRedirectTo:`${location.origin}/admin/`}
  });
  if(error)return show(error.message,true);
  $('#otpStep').classList.remove('hidden');
  show('Email sent. Enter the one-time code below. If your email contains a secure sign-in link instead, you can click that link.');
};

$('#verifyCodeBtn').onclick=async()=>{
  const token=$('#otpCode').value.trim();
  if(!token)return show('Enter the code from the email.',true);
  show('Verifying code…');
  const {error}=await supabase.auth.verifyOtp({email:ADMIN_EMAIL,token,type:'email'});
  if(error)return show(error.message,true);
  location.reload();
};
