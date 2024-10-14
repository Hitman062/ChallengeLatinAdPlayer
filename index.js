const { ipcRenderer } = require('electron');

let contentList = [];
let indexContent = 0;

playList();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function hide(elements) {
    elements.forEach((element) => {
        element.style.display = 'none';
    });
}

async function playList() {
    try {
        const video = document.getElementById('video-container');
        const image = document.getElementById('image-container');
        const iframe = document.getElementById('iframe-container');

        while (true) {
            if (contentList.length > 0) {
                const spinnerContainer =
                    document.getElementById('spinner-container');
                spinnerContainer.style.display = 'none';

                const content = contentList[indexContent];
                const contentType = content.type;
                const contentDuration = content.length;

                const objectFit = content.fill_screen ? 'fill' : 'contain';

                switch (contentType) {
                    case 'image':
                        hide([video, iframe]);
                        image.style.display = 'block';
                        image.style.objectFit = objectFit;
                        image.src = content.localPath;
                        break;
                    case 'video':
                        hide([image, iframe]);
                        video.style.display = 'block';
                        video.style.objectFit = objectFit;
                        video.src = content.localPath;

                        await new Promise((resolve) => {
                            video.onloadeddata = resolve;
                        });
                        video.play();
                        break;
                    case 'url':
                        hide([image, video]);
                        iframe.style.display = 'block';
                        iframe.src = content.url;
                        break;
                    default:
                        hide([image, video, iframe]);
                        console.error('Invalid content type');
                        break;
                }

                await delay(contentDuration * 1000);
                video.pause();

                indexContent = (indexContent + 1) % contentList.length;
            } else {
                await delay(1000);
            }
        }
    } catch (error) {
        console.error(error);
        await delay(1000);
        playList();
    }
}

ipcRenderer.on('send-content-list', (event, arg) => {
    contentList = arg;
});
