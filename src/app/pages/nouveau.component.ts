/*
 "l'Agenda Collaboratif"
 Copyright (C)  2016  Valentin VIENNOT
 Contact : vviennot@orange.fr

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 You have to put a copy of this program's license into your project.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 FULL LICENSE FILE : https://github.com/misterw97/agendacollaboratif/edit/master/LICENSE
 */
import {Component, OnInit} from "@angular/core";
import {NotificationService} from "../services/notification.service";
import {Devoir} from "../concepts/devoir";
import {Groupe} from "../concepts/groupe";
import {SyncService} from "../services/sync.service";
import {ParseService} from "../services/parse.service";
import {Router} from "@angular/router";
import {User} from "../concepts/user";

@Component({
  moduleId: module.id,
  templateUrl: './nouveau.component.html',
  providers: [ParseService]
})
export class NouveauComponent implements OnInit {

  user: User;
  fr: any;

  date: string;
  matiere: string;
  texte: string;

  constructor(private _notif: NotificationService,
              private _sync: SyncService,
              private _parse: ParseService,
              private router: Router) {
    this.user = this._parse.parse("user");
    this.texte = null;
    this.matiere = null;
    this.date = null;
  }

  ngOnInit(): void {
    let th: any = this;
    this._sync.syncUser().then(
      result => this.user = this._parse.parse("user"),
      function (erreur: string) {
        if (window.localStorage.getItem("user"))
          th.user = th._parse.parse("user");
        else
          th._notif.add(
            2, 'Problème de synchronisation',
            'Impossible de récupérer les données (' + erreur + ')');
      }
    );
    this.fr = {
      firstDayOfWeek: 1,
      monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
      monthNamesShort: ["jan", "fev", "mar", "avr", "mai", "jun",
        "jul", "aoû", "sep", "oct", "nov", "dec"],
      dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
      dayNamesShort: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
      dayNamesMin: ["D", "L", "Ma", "Me", "J", "V", "S"],
      dateFormat: "mm/dd/yy",
      isRTL: false,
      showMonthAfterYear: false,
      yearSuffix: ""
    };
  }

  ngOnDestroy(): void {
  }

  public save(): void {
    if (this.texte == null || this.matiere == null || this.date == null) {
      this._notif.add(1, 'Champs requis', 'Il faut tout compléter avant de pouvoir enregistrer (matière, date et texte)');
    } else {
      let devoirs: Devoir[] = this._parse.parse("devoirs");
      let devoir: Devoir = new Devoir();
      let matiere: Groupe = JSON.parse(this.matiere);
      devoir.texte = this.texte;
      devoir.matiere = matiere.nom;
      devoir.matiere_c = matiere.color;
      devoir.user = matiere.id;
      devoir.fait = false;
      devoir.nb_fait = 0;
      devoir.auteur = this.user.prenom + "" + this.user.nom;
      devoir.flag = 0;
      devoir.date = new Date(this.date);
      //devoir.date.setFullYear(+(this.date.substr(6,4)),(+this.date.substr(3,2)-1),+this.date.substr(0,2));
      devoir.date.setHours(20);
      devoir.date.setMinutes(0);
      devoir.date.setSeconds(0);
      let i: number;
      for (i = 0; i <= devoirs.length; i++) {
        if (i == devoirs.length || devoir.date <= devoirs[i].date)
          break;
      }
      devoirs.splice(i, 0, devoir);
      window.localStorage.setItem("devoirs", JSON.stringify(devoirs));
      let pending = this._parse.parse("pendADD");
      pending.push(devoir);
      window.localStorage.setItem("pendADD", JSON.stringify(pending));
      this.router.navigate(['/']);
    }
  }

  public getCourseValue(course: Groupe): string {
    return JSON.stringify(course);
  }
}
