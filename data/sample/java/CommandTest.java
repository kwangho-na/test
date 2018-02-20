
import java.util.*; 
public class CommandTest {
	public static void main(String[] args) {
    	try{
			System.out.print("> command: ");
			Scanner in = new Scanner(System.in);
			while( true ) {
				String line = in.nextLine();				
				if( line.equals("quit") ) break;
				int pos= line.indexOf("=>");
				if( pos==-1 ) {
					System.out.println("#print result: not vaild command (ex) plus=> 1, 2");
				}
				int len=line.length();
				if( len<5 ) {
					System.out.println("#print result: not vaild command line="+line);
				}
				String cmd=line.substring(0,pos).trim();
				String str=line.substring(pos+2, len-1);
				String[] arr=str.split(",");
				int result=0;
				
				System.out.println("#print: 커멘드="+cmd+" 값="+str  );
				try {
					if( cmd.equals("plus") ) {
						for( int n=0; n<arr.length; n++) {
							result+= Integer.parseInt(arr[n].trim());
						}
					} else if( cmd.equals("minus") ) {
						for( int n=0; n<arr.length; n++) { 
							if( n==0 ) {
								result = Integer.parseInt(arr[n].trim());
							} else {
								result-= Integer.parseInt(arr[n].trim());
							}
						}
					} else { 
						System.out.println("#print result: "+cmd+" is not vaild command (ex) plus=> 1, 2");
						continue;
					}
				} catch(Exception ex){ 
            		ex.printStackTrace();      
         		}
				System.out.println("> "+cmd+"=> "+result);
			}
			in.close();
			System.out.println("Scanner close");
    	}catch(Exception ex){
    		// if any error occurs
    		ex.printStackTrace();      
    	}
    } 
} 

