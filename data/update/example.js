## 주소록추가
db=Class.db("example");
insert=getQuery('address', 'id, name, addr, phone');

주소록추가=func(&s) {
	cur=_node();
	idx=1;
	while( s.valid() ) {
		name=s.findPos("\n").trim();
		cur[name]=name;
		cur[id]=lpad(idx,4);
		cur[addr]=lpad(System.rand(1000), 3);
		while(true) {
			a=System.rand(10000);
			if( a>999 ) {
				break;
			}
		}
		b=lpad(System.rand(100000), 4);
		cur[phone]="010-${a}-${b}");
		db.exec(insert, cur);
		idx++;
	}
};
db.exec("create table address (id text, name text, addr text, phone text)");
db.exec("delete from address");

주소록추가(Class.file().readAll('project/MyScript/data/example/names.txt') );
