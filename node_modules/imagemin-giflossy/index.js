'use strict';
const execBuffer = require('exec-buffer');
const giflossy = require('giflossy');
const isGif = require('is-gif');

module.exports = opts => buf => {
	opts = Object.assign({}, opts);

	if (!Buffer.isBuffer(buf)) {
		return Promise.reject(new TypeError('Expected a buffer'));
	}

	if (!isGif(buf)) {
		return Promise.resolve(buf);
	}

	const args = ['--no-warnings'];

	if (opts.interlaced) {
		args.push('--interlace');
	}

	if (opts.optimizationLevel) {
		args.push(`--optimize=${opts.optimizationLevel}`);
	}

	if (opts.colors) {
		args.push(`--colors=${opts.colors}`);
	}

	if (opts.lossy) {
		args.push(`--lossy=${opts.lossy}`);
	}

	// Image Transformation Options
	if (opts.resize) {
		args.push('--resize');
		args.push(opts.resize);
	}

	if (opts.noLogicalScreen) {
		args.push('--no-logical-screen');
	}

	if (opts.resizeMethod) {
		args.push('--resize-method');
		args.push(opts.resizeMethod);
	}

	// Color Options
	if (opts.colors) {
		args.push('--colors');
		args.push(opts.colors);
	}

	if (opts.colorMethod) {
		args.push('--color-method');
		args.push(opts.colorMethod);
	}

	// Animation Options
	if (opts.optimize) {
		args.push(`-O${opts.optimize}`);
	} else if (opts.unoptimize) {
		args.push('--unoptimize');
	}

	args.push('--output', execBuffer.output, execBuffer.input);

	return execBuffer({
		input: buf,
		bin: giflossy,
		args
	}).catch(err => {
		err.message = err.stderr || err.message;
		throw err;
	});
};
