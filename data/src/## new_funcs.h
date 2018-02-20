## 페이지 함수 저장
util_pageFuncSave( pageGroup, pageCode, &s, note, root ) { 
	not( root ) root=_node();
	root[tm]=System.localtime();
	err='';
	db=Class.db('pages');
	root[pageGroup]=pageGroup, root[pageCode]=pageCode;
	while( s.valid() ) {
		c=s.ch();
		not( c ) break;
		if( c.eq('/') ) {
			if( s.ch(1).eq('/') ) note.add( s.findPos("\n") );
			else if( s.ch(1).eq('*') ) note.add( s.match() );
			continue;
		}
		sp=s.cur(), s.move();
		c=s.ch();
		if( c.eq('.') ) {
			s.incr(), s.move();
			c=s.ch();
		}
		ep=s.cur();
		funcName=s.value(sp,ep,true);
		not( c.eq('(') ) {
			err.add("함수 시작오류 : 함수명 : $funcName\n");
			break;
		}
		funcParam=s.match().trim();
		c=s.ch();
		not( c.eq('{') ) {
			err.add("함수 매개변수 오류: $funcName, $funcParam\n");
			break;
		}
		body=s.match(1);
		root.put( funcName, funcParam, note );
		if( body.find('/*') || body.find('// ') ) {
			root[funcSrc]=body;
			root[funcData]=makeSrc(body);
		} else {
			root[funcSrc]='';
			root[funcData]=body;
		}
		num=db.exec("update pageFunc set funcSrc=#{funcSrc}, funcData=#{funcData}, funcParam=#{funcParam}, note=#{note}, tm=#{tm} where cmsCode=#{pageGroup} and pageCode=#{pageCode} and funcName=#{funcName}", root);
		not( num ) {
			if( funcName.eq('onInit') ) {
				root[sort]=1;
			} else if( funcName.start('on') ) {
				root[sort]=2;
			} else if( funcName.find('.') ) {
				root[sort]=3;
			} else {
				root[sort]=4;
			}
			db.exec("insert into pageFunc( cmsCode, pageCode, funcName, funcParam, funcSrc, funcData, note, tm, sort ) values (#{pageGroup}, #{pageCode}, #{funcName}, #{funcParam}, #{funcSrc}, #{funcData}, #{note}, #{tm}, #{sort} )", root);
		}
		note=''; 
	}
	return err;
}

## 클래스 함수 저장
util_classFuncSave( classGroup, className, &s, note, root ) { 
	tm=System.localtime();
	not( root ) root=_node();
	err='';
	db=Class.db('pages');
	root[class_grp]=classGroup, root[class_name]=className;
	while( s.valid() ) {
		c=s.ch();
		not( c ) break;
		
		if( c.eq('/') ) {
			if( s.ch(1).eq('/') ) note.add( s.findPos("\n") );
			else if( s.ch(1).eq('*') ) note.add( s.match() );
			continue;
		}
		func=s.move();
		c=s.ch();
		not( c.eq('(') ) {
			err.add("함수 시작오류 : 함수명 : $func");
			break;
		} 
		param=s.match().trim();
		c=s.ch();
		not( c.eq('{') ) {
			err.add("함수 매개변수 오류: $param");
			break;
		}
		body=s.match(1);
		root.varMap('class_func: func, class_param: param, note');
		if( body.find('//') || body.find('/*') ) {
			root[class_src]=body;
			root[class_data]=makeSrc(body);
		} else {
			root[class_src]='';
			root[class_data]=body;
		}
		table="class_info", ok=false;
		not( ok ) {
			num=db.exec("update ${table} set class_src=#{class_src}, class_data=#{class_data}, class_param=#{class_param}, note=#{note}, tm='$tm' where class_grp=#{class_grp} and class_nm=#{class_nm} and class_func=#{class_func}", root);
			not( num ) {
				db.exec("insert into ${table} ( class_grp, class_nm, class_func, class_param, class_src, class_data, note, tm ) values (#{class_grp}, #{class_nm}, #{class_func}, #{class_param}, #{class_src}, #{class_data}, #{note}, '$tm')", root);
			}
		}
		note='';
	}
	return err;
}

## 사용자 함수 저장

util_userFuncSave( funcGroup, &s  ) { 
	node=_node();
	err='', note='';
	db=Class.db('pages');

	node[func_grp]=funcGroup;
	while( s.valid() ) {
		ok=false;
		c=s.ch();
		if( c.eq('/') ) {
			if( s.ch(1).eq('/') ) {
				node[note]=s.findPos("\n").trim();
			} else if( s.ch(1).eq('*') ) {
				node[note]=s.match().trim();
			}
			c=s.ch();
		}
		node[func_nm]=s.move().trim();
		if( s.ch().eq('(') ) {
			param=s.match();
			if( s.ch().eq('{') ) {
				src=s.match(1);
				if( src.find('/*') || src.find('//') ) {
					node[funcSrc]=makeSrc(src);
				}
				node[src]=src;
				node[func_param]=param;
				ok=true;
			}
		} else {
			error="함수 시작오류";
			break;
		}
		if( ok ) {
			not( db.exec( conf('sql#dev.funcUpdate'), node) ) {
				db.exec( conf('sql#dev.funcInsert'), node);
			}
		}
		note='';
	}
	return err;
}

## [예제]
	node=_node();
	fileName='data/src/## new_funcs.h';
	node[funcSrc]=Class.file().readAll(fileName);
	s=node[funcSrc].ref();
	while( s.valid() ) {
		if( s.find("[## ", 1) ) {
			s.findPos("[## ", 1);
			s.findPos(" ##]");
			continue;
		}
		break;
	}
	s.ch();
	line=null, type=0;


	while( s.valid(), num, 0 ) {
		src=s.findPos('##', 1);
		if( line ) {
			if( type.eq(0) ) {
				// Cf.func( src );
				util_userFuncSave('KioskHitec', src);
				print("line=$num, $line");
			}
		}
		line=s.findPos("\n").trim();
		not( line ) {
			break;
		}
		type=0;
		if( line.start('[') ) {
			type=1;
		}
	}


	print("적용건수 : $num");

	datetime=System.date('yyyy-MM-dd HH:mm:dd');
	s=node[funcSrc];
	s.add("\r\n[## 사용자 함수 적용 : $datetime ##]\r\n\r\n ");

	Class.file().writeAll(fileName, s);
  
## [예제] 페이지 함수 DB저장
	node=_node();
	fileName='data/src/## new_funcs.h';
	node[funcSrc]=Class.file().readAll(fileName);
	s=node[funcSrc].ref();
	while( s.valid() ) {
		if( s.find("[## ", 1) ) {
			s.findPos("[## ", 1);
			s.findPos(" ##]");
			continue;
		}
		break;
	}
	s.ch();
	line=null, type=0;


	while( s.valid(), num, 0 ) {
		src=s.findPos('##', 1);
		if( line ) {
			not( type.eq(0) ) {
				return;
			}
			kind=line.move().trim();
			ch=line.ch();
			not( ch.eq('(') ) {
				continue;
			}
			param=line.match();
			param.split().inject(a,b);
			if( kind.eq('page') ) {
				p=pageLoad("${a}.${b}");
				p.func(src);
				util_pageFuncSave(a,b,src);
			}
		}
		line=s.findPos("\n");
		not( line ) {
			break;
		}
		type=0;
		if( line.start('[') ) {
			type=1;
		}
	}


	print("적용건수 : $num");

	datetime=System.date('yyyy-MM-dd HH:mm:dd');
	s=node[funcSrc];
	s.add("\r\n[## ============================== $datetime ============================== ##]\r\n\r\n ");

	Class.file().writeAll(fileName, s);
 
 
[## 페이지 함수 적용 : 2016-11-06 04:23:06 ##]

	node=_node();
	fileName='data/src/## page_funcs.h';
	node[funcSrc]=Class.file().readAll(fileName);
	s=node[funcSrc].ref();
	while( s.valid() ) {
		if( s.find("[## ", 1) ) {
			s.findPos("[## ", 1);
			s.findPos(" ##]");
			continue;
		}
		break;
	}
	s.ch();
	line=null, type=0;
 
	while( s.valid(), num, 0 ) {
		src=s.findPos('##', 1);
		if( line ) {
			not( type.eq(0) ) {
				return;
			}
			ch=line.ch();
			not( ch.eq('[') ) {
				continue;
			}
			param=line.match();
			param.split().inject(a,b);
			p=pageLoad("${a}.${b}");
			p.func(src);
			util_pageFuncSave(a,b,src);
		}
		line=s.findPos("\n");
		not( line ) {
			break;
		}
		type=0;
		if( line.start('[') ) {
			type=1;
		}
	}


	print("적용건수 : $num");
/*
	datetime=System.date('yyyy-MM-dd HH:mm:dd');
	s=node[funcSrc];
	s.add("\r\n[## ============================== $datetime ================================ ##]\r\n\r\n ");

	Class.file().writeAll(fileName, s);
	
*/	
 
[## ============================== 2016-11-06 04:46:06  ================================ ##]

 