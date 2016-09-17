<?php

	if ($_POST) $params = $_POST;
	else $params = $_GET;

	if ($params) {
		
		$url      = 'http://webapi.aitalk.jp/webapi/v2/ttsget.php?';
		$username = 'Musicians_Hackathon';
		$pass     = 'mfbXQe68';

		$text = $params['text'];
		$speaker_name = $params['speaker_name'];

		$url = $url.'username='.$username.'&password='.$pass.'&text='.$text.'&speaker_name='.$speaker_name.'&volume=2.00&range=2.00&pitch=1.20';

		$response = file_get_contents($url);
		file_put_contents('sound.ogg',$response);
		
	}

?>