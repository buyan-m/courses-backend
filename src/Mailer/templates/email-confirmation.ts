import Handlebars from 'handlebars'

const template = Handlebars.compile(`
<div style="max-width: 600px; padding: 20px;margin:0 auto;">
    <svg width="80" height="80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto;">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M100 -7.62939e-06C149 -7.62939e-06 200 39.5 200 100C200 164 146 200 100 200C47.5 200 0 158.5 0 100.5C0 35 54.5 -7.62939e-06 100 -7.62939e-06ZM12.5 58C21.1667 40.8333 51.7675 6.76164 101.5 12.5C153.5 18.5 182.226 55.0736 179.5 105.5C177.392 144.5 141 170.5 107.5 170.5C55.9394 170.5 41 123 41 104C41 73 63 41.5 101.5 41.5C150.5 41.5 160.5 95.5 160.5 100.5C163.333 85.1667 157 46.0714 113 28C85 16.5 25.1214 33 12.5 58Z" fill="#59C1D0"/>
    </svg>
    <h1>{{texts.registered}}</h1>
    <p>{{texts.confirm}}</p>
    <div style="font-size: 24px; text-align:center;">{{code}}</div>
    <a 
        target="_blank"
        href="https://okul.one/confirm-email?code={{code}}&email={{email}}"
        style="display: block;padding: 10px;background: #6abfcf;color: #fff;text-decoration: none;border-radius: 5px;text-align: center;margin-top: 15px;font-size: 18px;font-weight:600"
        >
        {{texts.confirmButtonText}}
    </a>
</div>
`)

export default template
