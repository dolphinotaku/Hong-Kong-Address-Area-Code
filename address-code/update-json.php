<?php

if(isset($_POST['json'])){
	
$fileName = "check-address-area.txt";
//$file = fopen($fn, "a+");
//$size = filesize($fn);
	//fwrite($file, $_POST['json']);

//$text = fread($file, $size);
//fclose($file);
$result = file_put_contents($fileName, $_POST['json']);

if($result){
	echo "update success";
}else{
	echo "update fail";
}
}
?>