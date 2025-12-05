import React from "react";

const teamMembers = [
    {
        name: "Бат-Өлзий Сайнцэцэг",
        role: "Frontend хөгжүүлэгч",
        img: "/team/sainaa.jpg",
    },
    {
        name: "Нямсүрэн Батцэцэг",
        role: "Frontend хөгжүүлэгч",
        img: "/team/battsetseg.jpg",
    },
    {
        name: "Хүрэлбаатар Баярмаа",
        role: "AI/API интеграц ",
        img: "/team/bayrmaa.jpg",
    },
    {
        name: "Лхамсүрэн Анхжаргал",
        role: "тестер",
        img: "/team/anhjargal.jpg",
    },
    {
        name: "Мишигдорж Азжаргал",
        role: "Frontend хөгжүүлэгч",
        img: "/team/azjargal.jpeg",
    },
    {
        name: "Жамц Өнөржаргал",
        role: "Frontend хөгжүүлэгч",
        img: "/team/unuruu.jpeg",
    },
    {
        name: "Мөнхбат Мягмартогтох",
        role: "төслийн менежер/ дизайнер",
        img: "/team/mygmartogtoh.jpeg",
    },
    {
        name: "Ерөөлт Мөнхцэцэг",
        role: "тестер",
        img: "/team/munkhuu.jpg",
    },

    {
        name: "Чойжилсүрэн Цэнд-Аюуш",
        role: "Backend хөгжүүлэгч",
        img: "/team/tsendee.jpg",
    },
    {
        name: "Пүрэвдагва Лхамсүрэн",
        role: "AI/API интеграц",
        img: "/team/lkham.jpg",
    },
    {
        name: "Женисхаан Алмагүль",
        role: "төслийн менежер/ дизайнер",
        img: "/team/almaguli.jpeg",
    },
    {
        name: "Гэрэлт-Од Мөнгөнчимэг",
        role: "AI/API интеграц",
        img: "/team/mungunchimeg.jpg",
    },
];

const Team = () => {
    return (
        <section className="team-section">
            <h2 className="team-title">Манай баг</h2>

            <div className="team-grid">
                {teamMembers.map((person, index) => (
                    <div className="team-card" key={index}>
                        <img src={person.img} alt={person.name} className="team-img" />
                        <h3 className="team-name">{person.name}</h3>
                        <p className="team-role">{person.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Team;
