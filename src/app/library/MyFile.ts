

export class MyFile {

  constructor() { }


  /**
  * 
  * @param filename 
  * File name e.g. file.txt or file.csv
  * @param text 
  * content of the file
  * 
  */
  public static downloadFile(filename: string, text: string) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  public static downloadFileFromUrl(filename: string, url : string){
    let element = document.createElement('a');
    element.setAttribute('href', url);
    element.setAttribute('target', '_blank');
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();


    document.body.removeChild(element);
  }

  // file
  public static addListenerToFileButton() {
    document.getElementById('files').addEventListener('change', (evt: any) => {
      let files: FileList = evt.target.files;

      console.log('Filename : ' + files[0].name);
      console.log('File Type : ' + files[0].type);

      // read the file content
      let reader = new FileReader();
      reader.onload = (e: any) => {
        console.log('File Result : ' + e.target.result);
      };
      reader.readAsText(files[0]);


    }, false);
  }

}