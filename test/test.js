let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/server");
let should = chai.should();

chai.use(chaiHttp); //Our parent block

describe("Queries", () => {
  describe("Q1", () => {
    it("it should GET the sitzverteilung", done => {
      chai
        .request(server)
        .get("/sitzverteilung")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(7);
          done();
        });
    });
  });

  describe("Q2", () => {
    it("it should GET the bundestagsmitglieder", done => {
      chai
        .request(server)
        .get("/bundestagsmitglieder")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(709);
          done();
        });
    });
  });

  describe("Add-On: Sieger & Verlierer", () => {
    describe("Sieger Erst", () => {
      it("it should GET the Sieger Erst", done => {
        chai
          .request(server)
          .get("/bundeslanderg/erst/sieger")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(16);
            done();
          });
      });
    });

    describe("Sieger Zweit", () => {
      it("it should GET the Sieger Zweit", done => {
        chai
          .request(server)
          .get("/bundeslanderg/zweit/sieger")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(16);
            done();
          });
      });
    });

    describe("Follower Erst", () => {
      it("it should GET the Follower Erst", done => {
        chai
          .request(server)
          .get("/bundeslanderg/erst/zweiter")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(16);
            done();
          });
      });
    });

    describe("Follower Zweit", () => {
      it("it should GET the Follower Zweit", done => {
        chai
          .request(server)
          .get("/bundeslanderg/zweit/zweiter")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(16);
            done();
          });
      });
    });
  });

  describe("Q3.1, Q3.2, Q4 (beispielhaft für 2017)", () => {
    it("it should GET the Q3.1, Q3.2, Q4 (beispielhaft für 2017)", done => {
      chai
        .request(server)
        .get("/wahlkreisuebersicht/2017")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(299);
          done();
        });
    });
  });

  describe("Q3.3, Q3.4", () => {
    it("it should GET", done => {
      chai
        .request(server)
        .get("/wahlkreisdetails/2017/10")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(7);
          done();
        });
    });
  });    

  describe("Q5 Überhangmandate", () => {
    it("it should GET", done => {
      chai
        .request(server)
        .get("/ueberhangmandate/2017")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(94);
          done();
        });
    });
  });  

  describe("Q6", () => {
    it("it should GET the knappste", done => {
      chai
        .request(server)
        .get("/knappste")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(430);
          done();
        });
    });
  });

  describe("umgewichtungPlot", () => {
    it("it should GET", done => {
      chai
        .request(server)
        .get("/umgewichtungPlot")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(5736);
          done();
        });
    });
  });

  describe("umgewichtung", () => {
    it("it should GET the umgewichtung", done => {
      chai
        .request(server)
        .get("/umgewichtung")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eq(43);
          done();
        });
    });
  });   

  describe("Team-Aufgaben - Quote", () => {
    describe("kandidaten gesamt", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/quote/kg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(1);
            done();
          });
      });
    }); 
    describe("btag gesamt", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/quote/bg")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(1);
            done();
          });
      });
    }); 
    describe("kandidaten parteiweise", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/quote/kp")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(43);
            done();
          });
      });
    }); 
    describe("btag parteiweise", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/quote/bp")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(7);
            done();
          });
      });
    }); 
  });

  describe("Teamaufgabe: Alter", () => {
    describe("kandidaten parteiweise", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/age/akp")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(43);
            done();
          });
      });
    }); 

    describe("bundestag parteiweise", () => {
      it("it should GET", done => {
        chai
          .request(server)
          .get("/age/abp")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("array");
            res.body.length.should.be.eq(7);
            done();
          });
      });
    }); 
  });

});
