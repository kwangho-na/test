CREATE TABLE ms_menus (
	menu_idx integer primary key autoincrement,		-- 인덱스
	menu_cd varchar(16),		-- 메뉴 코드
	menu_nm text,		-- 메뉴명
	menu_eng_nm text, --
	pidx integer default 0,
	pmenu_cd varchar(16),
	menu_url text,		-- 메뉴 소스경로
	menu_type char(1) default 'T',
	menu_sty char(1) default 'A',
	note text,		-- 메뉴 상세
	use_yn char(1) default 'Y',		-- 사용여부
	child_cnt integer default 0,
	tm int64 DEFAULT '0', 
	reg_dt datetime DEFAULT (datetime('now','localtime'))
);

CREATE TABLE ms_boards (
	bidx integer primary key autoincrement,		-- 인덱스
	pidx integer default 0,
	tags text,
	subject text,
	data text,
	note text,
	sort integer default 0,
	board_type char(1) default 'A',
	board_sty char(1) default 'A',
	use_yn char(1) default 'Y',		-- 사용여부
	reply_cnt integer default 0,
	tm int64 DEFAULT '0', 
	reg_dt datetime DEFAULT (datetime('now','localtime'))
);

CREATE TABLE ms_tag_map (
	bidx integer,
	tag text,
	PRIMARY KEY (bidx, tag)
);

CREATE TABLE ms_contents (
	cidx integer primary key autoincrement,		-- 인덱스
	menu_idx integer,
	tag text,
	title text,
	src text,
	note text,
	comment text,
	hr_yn char(1) default 'N',
	type char(1) default 'A',
	tm int64 DEFAULT '0', 
	reg_dt datetime DEFAULT (datetime('now','localtime'))
);
