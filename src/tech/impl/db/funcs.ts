function escapeString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/'/g, '\\\'');
}

function escapeValue(value: any): any {
    if (typeof value === 'string') {
        return `'${escapeString(value)}'`;
    } else if (Array.isArray(value)) {
        return value.map(escapeValue).join(', ');
    } else {
        return value;
    }
}

export function escapeQuery(query: string, params: {[key: string]: any}): string {
    Object.keys(params)
        .forEach((paramName) => {
            query = query.replace(new RegExp(`:${paramName}`, 'g'), escapeValue(params[paramName]));
        });

    if (query.match(/\:[a-zA-Z\-_]+/)) {
        console.log('*** UNCOVERED TOKENS FOUND ***');
    }

    return query;
}
