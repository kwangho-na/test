##> page#xml.kiosk#AdminLogin = <Page Width="1080" Height="1920" >
    <AdminLogin BackgroundImage="${imagePath}/admin/admin_login_bg.png" ClassPath="admin">
 		<!-- FontSize="40" Foreground="#FFF4F4F4" FontFamily="Dinreg"-->
		<StoreTitle Margin="35,31,0,0" Width="658" Height="78"   class="layer"/>
		<StoreName Margin="163,561,0,0" Height="89" class="layout"/>

        <UserNameLabel Margin="347,693,0,0" Width="346" Height="74" class="layer" src="${imagePath}/admin/login_select.png" />
        <PassWordLabel Margin="347,771,0,0" Width="346" Height="74" class="layer" src="${imagePath}/admin/login_select.png" />
		<!-- FontSize="42" FontWeight="Bold"  Foreground="#FF3D3D3F" -->
        <UserNameInput Margin="363,705,0,0" Width="315" Height="56" class="layer"/>
        <PassWordInput Margin="363,783,0,0" Width="315" Height="56" class="layer"/>


        <AdminNumberPad Margin="329,982,0,0"  ButtonWidth="134" ButtonHeight="119" class="layer" 
			NumberButton="${imagePath}/admin/login_num_[#].png" 
			ResetButton="${imagePath}/admin/login_num_re_[#].png"
			DeleteButton="${imagePath}/admin/login_num_del_[#].png"
		/>
		<!-- FontSize="78" Foreground="#FFF4F4F4" FontFamily="Dinreg"-->
        <CurrentTime Margin="864,17,0,0" Width="200" Height="111" text="00:00" class="layer"/>

		<!-- FontSize="30" Foreground="#FFF4F4F4" FontFamily="Dinreg"-->
        <CurrentDate Margin="680,64,0,0"  Width="174" Height="45" class="layer" text="2015.00.00" />
        <CurrentPosNo Margin="680,31,0,0" Width="174" Height="45" class="layer" />


        <LogInButton Margin="700,693,0,0" Height="154" Width="174" class="layer" src="${imagePath}/admin/btn_login_[#].png"/>
        <ExitButton Margin="778,1788,0,0"  Height="94" Width="264" class="layer" src="${imagePath}/admin/btn_close_[#].png"/>
    </AdminLogin>
</Page>

##> page#xml.kiosk#AdminHome = <Page Width="1080" Height="1920">
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <AdminHome Width="1080" Height="1793" Margin="0,127,0,0" class="layer" BackgroundImage="${imagePath}/admin/admin_home_bg.png">
        <Description Width="1080" Height="89" Margin="0,505,0,0"  class="layer"/>
        <SalesOpenButton Width="574" Height="129" Margin="253,650,0,0"  class="layer" src="${imagePath}/admin/home_btn1_[#].png"/>
        <SalesCloseButton Width="574" Height="129" Margin="253,802,0,0"  class="layer" src="${imagePath}/admin/home_btn1_1_[#].png"/>
        <GoKioskMainButton Width="574" Height="129" Margin="253,954,0,0"  class="layer" src="${imagePath}/admin/home_btn1_2_[#].png"/>
        <SalesStatusButton Width="574" Height="129" Margin="253,1106,0,0"  class="layer" src="${imagePath}/admin/home_btn3_[#].png"/>
        <CashManageButton Width="574" Height="129" Margin="253,1258,0,0"  class="layer" src="${imagePath}/admin/home_btn4_[#].png"/>
        <SoldOutButton Width="574" Height="129" Margin="253,1410,0,0"  class="layer" src="${imagePath}/admin/home_btn5_[#].png"/>
        <TurnOutButton Width="574" Height="129" Margin="253,1561,0,0"  class="layer" src="${imagePath}/admin/home_btn6_[#].png"/>
        <ExitButton Width="264" Height="94" Margin="779,1789,0,0"  class="layer" src="${imagePath}/admin/btn_close_[#].png"/>
    </AdminHome>
</Page>


##> page#xml.kiosk#SaleOpenView = <Page Width="1080" Height="1920">
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <SaleOpenView Width="1080" Height="1793" Margin="0,127,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_start_bg.png"/>
</Page>


##> page#xml.kiosk#SaleCloseView = <Page Width="1080" Height="1920">
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <SaleCloseView Width="1080" Height="1793" Margin="0,127,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_close_bg.png"/>
</Page>

##> page#xml.kiosk#SaleStatusView = <Page Width="1080" Height="1920" >
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <SaleStatusView Width="1080" Height="1793" Margin="0,127,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_cancel_bg.png"/>
</Page>


##> page#xml.kiosk#SoldOutView = <Page Width="1080" Height="1920">
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <SoldOutView Width="1080" Height="1793" Margin="0,127,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_soldout_bg.png"/>
	<Popup id="Loading" class="popup"/>
	<Popup id="PopupLoading" padding="20" class="popup"/>
	<Popup id="MessageWindow" class="popup"/>
</Page>

##> page#xml.kiosk#TurnOutView = <Page Width="1080" Height="1920">
    <AdminTitle Width="1080" Height="127" Margin="0,0,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_title.png"/>
    <TurnOutView Width="1080" Height="1793" Margin="0,127,0,0" class="layer" ClassPath="admin" BackgroundImage="${imagePath}/admin/admin_turnout_bg.png"/>
</Page>
 