import React from 'react';
import './App.css';

import { Button, ButtonGroup, TextField, Link, Paper, Typography, Divider, LinearProgress } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import BackupIcon from '@material-ui/icons/Backup';
import { makeStyles } from '@material-ui/core/styles';
import logo from './assets/favicon.png';
// For the drag and drop functionality 
import { DropzoneArea } from 'material-ui-dropzone';
import S3 from 'aws-s3';
import { keys } from './keys.js';

const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: keys.s3ID,
  secretAccessKey: keys.s3Secret,
  region: 'ca-central-1',
});

const config = {
  bucketName: 'assets-vjk',
  dirName: 'files',
  region: 'ca-central-1',
  accessKeyId: keys.s3ID,
  secretAccessKey: keys.s3Secret,
}

const ses = new AWS.SES();
  

function App() {

  // The files from the dropzone
  const [files, setFiles] = React.useState([]);
  const [filename, setFilename] = React.useState("");
  const [fileURL, setFileURL] = React.useState("No passcode generated yet. Click on the GENERATE CODE button!");
  const [from, setFrom] = React.useState("");
  const [passcode, setPasscode] = React.useState(".");
  const [textValue, setTextValue] = React.useState("");
  const [sendingFile, setSendingFile] = React.useState(false);

  function makePasscode(length) {
    setFileURL("Generating & Sending passcode...");
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    setPasscode(result);

    const params = {
      Destination: {
          ToAddresses: ["vivekandath@gmail.com"]
      },
      Message: {
          Body: { 
              Text: {
                  Charset: "UTF-8",
                  Data: `File send request from ${from}. Passcode: ${result}`
              }
          },
          Subject: {
              Charset: 'UTF-8',
              Data: "passcode"
          }
      },
      ReturnPath: keys.ses.from.default,
      Source: keys.ses.from.default,
  };

    ses.sendEmail(params, (err, data) => {
      if (err) {
          return console.log(err, err.stack);
      } else {
          console.log("Email sent.", data);
      }
    });
  }

  const useStyles = makeStyles({
    dropzone: {
      width: '48%'
    },
    button: {
      background: ((passcode !== textValue) || files.length === 0) ? 'grey' : 'linear-gradient(45deg, #e52d27 30%, #b31217 90%)',
      border: 0,
      borderRadius: 8,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      fontWeight: 'bold',
      fontSize: "16px",
      height: 56,
      width: 100,
      padding: 20,
      marginLeft: 30,
      textDecoration: 'none'
    },
    passcodeButton: {
      background: 'linear-gradient(45deg, #e52d27 30%, #b31217 90%)',
      border: 0,
      borderRadius: 8,
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      color: 'white',
      fontWeight: 'bold',
      fontSize: "16px",
      height: 56,
      width: 180,
      padding: 20,
      marginLeft: 30,
      textDecoration: 'none'
    },
    input: {
      height: 100,
      margin: 20,
    },
    instructions: {
      margin: "8px 30px 8px 30px"
    }
  });

  const classes = useStyles();

  return (
    <div className="App">
      <div>
        {sendingFile ? <LinearProgress color="secondary" /> : null}
      </div>
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 140, 
        marginTop: 40, 
        marginBottom: 30
      }}>
        <img src={logo} alt={"VK"} style={{ width: 120, margin: 20 }} />
      <Divider flexItem orientation="vertical" />
        <div style={{
          borderRadius: 8,
          height: 75,
          marginLeft: 30,
          marginTop: 40,
          justifyContent: 'center'
        }}>
          <Typography variant="h5">Send a File</Typography>
        </div>
      </div>
      <Typography variant="body1" className={classes.instructions}>{"Drag & drop any file (up to 10GB) below, then click on the "}<b style={{ color: "#b31217" }}>GENERATE CODE</b> button.{" You can optionally specify the file name as well."}</Typography>
      <Typography variant="body1" className={classes.instructions} >{"I will then provide you with the generated passcode (sent to me via email) which you can enter in the field below and send the file."}</Typography>
      <TextField
        id="outlined-multiline-static"
        label="File Name"
        multiline
        rows={1}
        defaultValue=''
        variant="outlined"
        value={filename}
        onChange={(event) => {
          setFilename(event.target.value);
        }}
        className={classes.input}
        style={{ marginTop: 25, width: '14%' }}
      />
      <TextField
        id="outlined-multiline-static"
        label="From (Your Name) *"
        multiline
        error={from === ""}
        rows={1}
        defaultValue=''
        variant="filled"
        value={from}
        onChange={(event) => {
          setFrom(event.target.value);
        }}
        className={classes.input}
        style={{ marginTop: 25, width: '14%' }}
      />
      <TextField
        id="outlined-multiline-static"
        label="Passcode *"
        multiline
        error={passcode !== textValue || passcode === "."}
        rows={1}
        defaultValue=''
        variant="filled"
        value={textValue}
        onChange={(event) => {
          setTextValue(event.target.value);
        }}
        className={classes.input}
        style={{ marginTop: 25, width: '14%' }}
      />
      <Typography variant="body1" style={{ marginBottom: 20 }} >{fileURL}</Typography>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <DropzoneArea
          dropzoneClass={classes.dropzone}
          maxFileSize={10000000000}
          filesLimit={1}
          dropzoneText={"Drag a file here..."}
          onChange={(fileArray) => {
            // Set the current file to the image
            setFiles(fileArray);
          }}
        />
      </div>
      <div style={{ margin: 20 }} />
      <Typography variant="button" style={{ fontSize: 14 }} >{files.length === 0 ? `Warning: No File Added` : `File Ready to Send (${filename === "" ? "No filename set" : `Filename: ${filename}`})`}</Typography>
      <div style={{ margin: "30px" }}>
        <Button
          className={classes.passcodeButton}
          target='_blank'
          disabled={passcode !== "."}
          onClick={() => {
            makePasscode(11);
            setFileURL("Passcode Sent");
          }}
        >
          Generate Code
        </Button>
        <Button
          className={classes.button}
          target='_blank'
          startIcon={(passcode !== textValue) || files.length === 0 ? <WarningIcon /> : <BackupIcon />}
          disabled={(passcode !== textValue) || files.length === 0 || passcode === "."}
          onClick={() => {
            // Upload the snippet to an S3 bucket with a randomized filename
            const S3Client = new S3(config);

            setFileURL("Transferring File...");
            setSendingFile(true);

            S3Client
              .uploadFile(files[0], filename)
              .then(data => {
                setFileURL(`File successfully sent! Download from: ${data.location}`);
                console.log("Successfully added file:", fileURL);
                setSendingFile(false);
              })
              .catch(err => console.error(err));
          }}
        >
          SEND
        </Button>
      </div>
    </div>
  );
}

export default App;