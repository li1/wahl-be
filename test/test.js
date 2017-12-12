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
});
