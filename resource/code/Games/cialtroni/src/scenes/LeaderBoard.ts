import { FirebaseApp, initializeApp } from 'firebase/app';
import { Database, ref, push, getDatabase, DatabaseReference, onValue } from 'firebase/database';
import { Auth, getAuth, signInAnonymously } from 'firebase/auth';
import GameOver from './GameOver';
import Win from './Win'
import Intro from './Intro';
import { firebaseConfig } from '../config/firebase.config';

export class Leaderboard {

    private _fireBaseApp: FirebaseApp;
    private _fireBaseDb: Database;
    private _scores: DatabaseReference;
    private _highScores: Array<any> = [];
    private _auth: Auth;
    private _scene: GameOver | Intro | Win;
    private _isLoaded: boolean = false;

    constructor(scene: Phaser.Scene) {

        this._fireBaseApp = initializeApp(firebaseConfig);
        this._fireBaseDb = getDatabase(this._fireBaseApp);
        this._scores = ref(this._fireBaseDb, 'scores-cialtroni');
        this._highScores = [];
        this._auth = getAuth(this._fireBaseApp);
        this._scene = <GameOver | Win | Intro>scene;


        signInAnonymously(this._auth).then(() => {


           
            this.getSnapshot().then((data) => {
                this._isLoaded = true;
                this._scene.setUpScene();
            });



        }).catch((error: any) => {
            console.log("Error signing in", error);
        });
    }

    public saveScore(scoreObj: { score: number, name: string, date: string }): void {

        push(this._scores, scoreObj);
    }

    public isLoaded(): boolean {
        return this._isLoaded;
    }

    private async getSnapshot(): Promise<any> {

        this._highScores = [];



        return new Promise((resolve, reject) => {
            onValue(this._scores, (snapshot: any) => {


           
                if (!snapshot.exists()) {
                    resolve(this._highScores);
                    return;
                } else {
                    Object.entries(snapshot.val()).forEach((entry: any) => {
                        this._highScores.push(entry[1]);
                    });
                    //sort the array by score
                    this._highScores.sort((a, b) => {
                        return b.score - a.score;
                    });
                    // return top 3
                    this._highScores = this._highScores.slice(0, 5);

                    resolve(this._highScores)
                }


            });

        });



    }


    public getHighScores(): Array<any> {

        return this._highScores;
    }




}
