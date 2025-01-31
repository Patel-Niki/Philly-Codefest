import React, { useState, useRef } from 'react';
import axios from 'axios';
import "../css/recorder.css";

const AudioRecorder = () => {
    const [recording, setRecording] = useState(false);
    const [audioData, setAudioData] = useState(null);
    const [audioURL, setAudioURL] = useState("");
    const mediaRecorderRef = useRef(null);
    const fileInputRef = useRef(null);

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (e) => {
            setAudioData(e.data);
            setAudioURL(URL.createObjectURL(e.data));
        };
        mediaRecorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setRecording(false);
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    };

    const uploadAudio = async () => {
        if (!audioData) {
            alert("No audio to upload");
            return;
        }
        const formData = new FormData();
        formData.append('audio', audioData, 'audio.wav');

        try {
            const response = await axios.post('http://localhost:8000/uploadwav', formData);
            alert('Uploaded successfully');
            console.log('Uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert("No file selected");
            return;
        }
        const formData = new FormData();
        formData.append('audio', file, file.name);

        try {
            const response = await axios.post('http://localhost:8000/uploadwav', formData);
            alert('File uploaded successfully');
            console.log('File uploaded successfully:', response.data);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file');
        }
    };

    return (
        <div className="audio-recorder">
            <div className="button-container">
                <button className={`record-button ${recording ? 'recording' : ''}`} onClick={startRecording} disabled={recording}>
                    {recording ? 'Recording...' : 'Start Recording'}
                </button>
                <button className="stop-button" onClick={stopRecording} disabled={!recording}>Stop Recording</button>
            </div>
            <div className="upload-container">
                <button className="upload-button" onClick={uploadAudio} disabled={!audioData}>Upload Recorded Audio</button>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} accept="audio/*" />
                <button className="upload-button" onClick={() => fileInputRef.current.click()}>Upload Audio File</button>
            </div>
            <div className="audio-player">
                <audio src={audioURL} controls />
            </div>
        </div>
    );
};

export default AudioRecorder;
