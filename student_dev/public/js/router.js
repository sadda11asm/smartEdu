function generateContent()
	{
		let href = top.location.href.split('/');
		hr = href[3];
		params = href[4];

		if(!hr) hr = 'profile';
	
		paintMenu(hr);

		switch(hr)
		{
			case 'profile':  	getProfilePage(); 		break;
			case 'schedule': 	getSchedulePage(); 		break;
			case 'groups': 		getGroupsPage(); 		break;
			case 'courses': 	getCoursesPage(); 		break;
			case 'tests': 		getTestsPage(); 		break;
			case 'test': 		getTestPage(params);    break;
			case 'chat': 		getChatPage(); 			break;
			case 'homework': 	getHomeWorkPage(params);break;
			case 'exit': 		exitSystem();			break;
			case 'request': 	getRequestPage(params); break;
			default: 	 		getNotFoundPage();		break;
		}
	}

window.onpopstate = function()
{
	generateContent();
}

generateContent();