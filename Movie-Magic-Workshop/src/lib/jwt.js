import jsonwebtoken from 'jsonwebtoken';
import util from 'util';

const verify = util.promisify(jsonwebtoken.verify);
const sign = util.promisify(jsonwebtoken.sign);

export default {
    verify,
    sign,
}

/* export const verify = (token, secret, options) => {

    const promise = new Promise((resolve, reject) => {
        jsonwebtoken.verify(token, secret, options, (err, decoded) => {
            if (err) {
                reject(err);
            }

            resolve(decoded);

        });
    });

    return promise;
} */