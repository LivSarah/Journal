"use strict";

const _ = require("lodash");
const express = require("express");
const db = require("../models");

function journal(app, mount_path) {
	const router = express.Router();
	router.get("/", (req, res) => {
		db.journalentry.findAll({ where: { user_id: req.user.email.user.id } }).then(journalentries => {
			res.status(200).json(journalentries.map(item => item.dataValues));
		});
	});

	router.post("/", (req, res) => {
		const { body: body2 = {} } = req;
		const { title, subtitle, body, IMG } = body2;

		if (!title) {
			return res.status(400).json({ error: "title required" });
		}

		if (!body) {
			return res.status(400).json({ error: "text required" });
		}

		db.journalentry
			.create({ title, subtitle, body, IMG, user_id: req.user.email.user.id })
			.then(result => {
				console.log("RESULT", result);
				res.setHeader("Location", `${mount_path}/${result.id}`);
				res.status(201).json(result.dataValues);
			})
			.catch(err => console.error(err));
	});

	router.get("/:id", (req, res) => {
		const { id } = req.params;

		db.journalentry
			.findByPk(id)
			.then(journalentry => {
				if (journalentry) {
					return res.status(200).json(journalentry.dataValues);
				}
				return res.status(404).end();
			})
			.catch(err => {
				console.error(err);
				res.status(400).end();
			});
	});

	const upsert = (req, res) => {
		const { body: body2 = {} } = req;

		if (!body2.id && req.params.id) {
			body2.id = req.params.id;
		}
		const { title, subtitle, body, IMG } = body2;

		if (!title) {
			return res.status(400).json({ error: "title required" });
		}

		if (!body) {
			return res.status(400).json({ error: "text required" });
		}

		/*
		var entry = {
			title: title,
			subtitle: subtitle,
			body: body,
			IMG: IMG
		}

		db.journalentry.findByPk(body2.id)
			.then(Entry => {
				return Entry.set(entry).save();
			})
			.then(updatedEntry => {
				res.status(200).json(updatedEntry);
			});
		*/
		db.journalentry.upsert(body2, { returning: true }).then(([journalentry]) => {
			res.status(200).json(journalentry.dataValues);
		});
	};

	router.put("/", upsert);
	router.put("/:id", upsert);

	router.patch("/:id", (req, res) => {
		const { id } = req.params;
		const { body: body2 = {} } = req;

		const patch = _.pick(body2, ["title", "subtitle", "body", "IMG"]);

		db.journalentries
			.findByPk(id)
			.then(journalentry => {
				if (journalentry) {
					return journalentry.set(patch).save();
				}

				return res.status(404).end();
			})
			.then(journalentry => res.staus(200).json(journalentry.dataValues));
	});

	router.delete("/:id", (req, res) => {
		const { id } = req.params;

		db.journalentry
			.findByPk(id)
			.then(journalentry => {
				return journalentry.destroy();
			})
			.then(() => {
				res.status(204).end();
			});
	});
	app.use(mount_path, router);
}

module.exports = journal;
