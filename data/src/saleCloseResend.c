req=Cf[HitecReqNode];
not( req ) {
	req={  method:'POST', header: {} };
	Cf[HitecReqNode]=req;
}
req[url]='http://61.78.39.134/telex_rh2/T40_Rcv.php';
file=Class.file('test');
web=Class.web('hitecSend');
web[data] =file.readAll("data/saleCloseResend.txt");
web.call( req, callback(type,data) {
	switch(type) {
		case read:
			data = data.utf8();
			print("# 정산전문 응답 ==> ################################  $data ####################################");	
		case error:
			print("## 정산전문 전문 응답오류 => $data",true);
	}
});
