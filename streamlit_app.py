import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go

# -----------------------------------------------------------------------------
# Page Configuration
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Netflix Data Visualizer | Saad Akhtar",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling (Netflix-inspired Dark Theme)
st.markdown("""
<style>
    /* Global styles */
    .main {
        background-color: #141414;
        color: #FFFFFF;
    }
    .metric-card {
        background: linear-gradient(135deg, #1f1f23 0%, #18181c 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    .metric-value {
        font-size: 2.2rem;
        font-weight: 800;
        color: #E50914;
        margin: 0;
    }
    .metric-label {
        font-size: 0.85rem;
        color: #A1A1AA;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: 4px;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 48px;
        border-radius: 8px;
        padding-left: 20px;
        padding-right: 20px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Dataset Loader / Fallback Generator
# -----------------------------------------------------------------------------
@st.cache_data
def load_data():
    # Attempt to load local or remote dataset, or generate standard curated sample
    try:
        url = "https://raw.githubusercontent.com/datasets/netflix-shows/master/data/netflix-titles.csv"
        df = pd.read_csv(url)
    except Exception:
        # High quality sample fallback dataset
        data = {
            'show_id': [f's{i}' for i in range(1, 26)],
            'type': ['Movie', 'TV Show', 'Movie', 'TV Show', 'Movie', 'Movie', 'TV Show', 'Movie', 'TV Show', 'Movie',
                     'Movie', 'TV Show', 'Movie', 'TV Show', 'Movie', 'Movie', 'TV Show', 'Movie', 'TV Show', 'Movie',
                     'Movie', 'TV Show', 'Movie', 'TV Show', 'Movie'],
            'title': ['Stranger Things', 'Inception', 'Breaking Bad', 'The Witcher', 'Interstellar',
                      'Squid Game', 'The Queen\'s Gambit', 'Parasite', 'Dark', 'Pulp Fiction',
                      'Money Heist', 'Spirited Away', 'Black Mirror', 'The Irishman', 'Peaky Blinders',
                      'Whiplash', 'Mindhunter', 'The Dark Knight', 'Narcos', 'Spider-Man: Into the Spider-Verse',
                      'The Matrix', 'Better Call Saul', 'Fight Club', 'The Crown', 'Avatar'],
            'director': ['The Duffer Brothers', 'Christopher Nolan', 'Vince Gilligan', 'Lauren Schmidt Hissrich', 'Christopher Nolan',
                         'Hwang Dong-hyuk', 'Scott Frank', 'Bong Joon-ho', 'Baran bo Odar', 'Quentin Tarantino',
                         'Álex Pina', 'Hayao Miyazaki', 'Charlie Brooker', 'Martin Scorsese', 'Steven Knight',
                         'Damien Chazelle', 'David Fincher', 'Christopher Nolan', 'Carlo Bernard', 'Peter Ramsey',
                         'Lana Wachowski', 'Vince Gilligan', 'David Fincher', 'Peter Morgan', 'James Cameron'],
            'cast': ['Millie Bobby Brown', 'Leonardo DiCaprio', 'Bryan Cranston', 'Henry Cavill', 'Matthew McConaughey',
                     'Lee Jung-jae', 'Anya Taylor-Joy', 'Song Kang-ho', 'Louis Hofmann', 'John Travolta',
                     'Úrsula Corberó', 'Rumi Hiiragi', 'Daniel Lapaine', 'Robert De Niro', 'Cillian Murphy',
                     'Miles Teller', 'Jonathan Groff', 'Christian Bale', 'Wagner Moura', 'Shameik Moore',
                     'Keanu Reeves', 'Bob Odenkirk', 'Brad Pitt', 'Claire Foy', 'Sam Worthington'],
            'country': ['United States', 'United States', 'United States', 'United States', 'United States',
                        'South Korea', 'United States', 'South Korea', 'Germany', 'United States',
                        'Spain', 'Japan', 'United Kingdom', 'United States', 'United Kingdom',
                        'United States', 'United States', 'United States', 'United States', 'United States',
                        'United States', 'United States', 'United States', 'United Kingdom', 'United States'],
            'date_added': ['September 24, 2021', 'August 1, 2021', 'June 10, 2020', 'December 20, 2019', 'November 1, 2020',
                           'September 17, 2021', 'October 23, 2020', 'October 11, 2020', 'December 1, 2017', 'January 1, 2019',
                           'September 3, 2021', 'March 1, 2020', 'June 5, 2019', 'November 27, 2019', 'October 4, 2019',
                           'November 1, 2020', 'August 16, 2019', 'May 1, 2020', 'August 28, 2015', 'June 26, 2019',
                           'January 1, 2020', 'February 8, 2015', 'October 15, 2019', 'November 4, 2016', 'December 1, 2021'],
            'release_year': [2016, 2010, 2008, 2019, 2014, 2021, 2020, 2019, 2017, 1994, 2017, 2001, 2011, 2019, 2013, 2014, 2017, 2008, 2015, 2018, 1999, 2015, 1999, 2016, 2009],
            'rating': ['TV-14', 'PG-13', 'TV-MA', 'TV-MA', 'PG-13', 'TV-MA', 'TV-MA', 'R', 'TV-MA', 'R', 'TV-MA', 'PG', 'TV-MA', 'R', 'TV-MA', 'R', 'TV-MA', 'PG-13', 'TV-MA', 'PG', 'R', 'TV-MA', 'R', 'TV-MA', 'PG-13'],
            'duration': ['4 Seasons', '148 min', '5 Seasons', '3 Seasons', '169 min', '1 Season', '1 Season', '132 min', '3 Seasons', '154 min', '5 Seasons', '125 min', '5 Seasons', '209 min', '6 Seasons', '106 min', '2 Seasons', '152 min', '3 Seasons', '117 min', '136 min', '6 Seasons', '139 min', '6 Seasons', '162 min'],
            'listed_in': ['Sci-Fi & Fantasy, Dramas', 'Action & Adventure, Sci-Fi', 'Crime TV Shows, Dramas', 'TV Action & Adventure, Sci-Fi', 'Sci-Fi & Fantasy, Dramas',
                          'International TV Shows, Dramas', 'Dramas, TV Mini-Series', 'Comedies, Dramas, International', 'Crime TV Shows, International, Sci-Fi', 'Classic Movies, Cult Movies, Dramas',
                          'Crime TV Shows, International', 'Anime Features, International', 'British TV Shows, Sci-Fi', 'Dramas, Crime Movies', 'British TV Shows, Crime TV Shows',
                          'Dramas, Independent Movies', 'Crime TV Shows, Dramas', 'Action & Adventure, Dramas', 'Crime TV Shows, Action TV Shows', 'Action & Adventure, Comedies, Sci-Fi',
                          'Action & Adventure, Sci-Fi', 'Crime TV Shows, Dramas', 'Cult Movies, Dramas', 'British TV Shows, Dramas', 'Action & Adventure, Sci-Fi'],
            'description': ['When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
                            'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
                            'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
                            'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world.',
                            'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'] * 5
        }
        df = pd.DataFrame(data)
    
    # Data Cleaning & Feature Extraction
    df['date_added'] = pd.to_datetime(df['date_added'].str.strip(), errors='coerce')
    df['year_added'] = df['date_added'].dt.year.fillna(df['release_year']).astype(int)
    df['country'] = df['country'].fillna('Unknown')
    df['rating'] = df['rating'].fillna('Not Rated')
    
    return df

df = load_data()

# -----------------------------------------------------------------------------
# Sidebar Navigation & Filters
# -----------------------------------------------------------------------------
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", width=160)
    st.title("Filters & Controls")
    
    # Type Filter
    content_types = ["All"] + sorted(df['type'].dropna().unique().tolist())
    selected_type = st.selectbox("Content Type", content_types)
    
    # Year Range Filter
    min_year = int(df['release_year'].min())
    max_year = int(df['release_year'].max())
    year_range = st.slider("Release Year Range", min_year, max_year, (min_year, max_year))
    
    # Country Filter
    countries = ["All"] + sorted(list(set([c.strip() for sub in df['country'].dropna().str.split(',') for c in sub if c.strip()])))
    selected_country = st.selectbox("Production Country", countries[:50])
    
    st.markdown("---")
    st.markdown("👨‍💻 **Developer:** Saad Akhtar")
    st.markdown("🔗 [Portfolio](https://github.com/saaddahub/personal-portfolio)")
    st.markdown("📚 *Created for educational & analytical purposes.*")

# Apply Filters
filtered_df = df.copy()

if selected_type != "All":
    filtered_df = filtered_df[filtered_df['type'] == selected_type]

filtered_df = filtered_df[
    (filtered_df['release_year'] >= year_range[0]) & 
    (filtered_df['release_year'] <= year_range[1])
]

if selected_country != "All":
    filtered_df = filtered_df[filtered_df['country'].str.contains(selected_country, na=False, regex=False)]

# -----------------------------------------------------------------------------
# Main Header
# -----------------------------------------------------------------------------
st.title("🎬 Netflix Movies & TV Shows Analytics")
st.markdown("Explore trends, genre distributions, content growth, and insights across global Netflix titles.")

# -----------------------------------------------------------------------------
# KPI Cards
# -----------------------------------------------------------------------------
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="metric-card">
        <p class="metric-value">{len(filtered_df):,}</p>
        <p class="metric-label">Total Titles</p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    movies_count = len(filtered_df[filtered_df['type'] == 'Movie'])
    st.markdown(f"""
    <div class="metric-card">
        <p class="metric-value">{movies_count:,}</p>
        <p class="metric-label">Movies</p>
    </div>
    """, unsafe_allow_html=True)

with col3:
    tv_count = len(filtered_df[filtered_df['type'] == 'TV Show'])
    st.markdown(f"""
    <div class="metric-card">
        <p class="metric-value">{tv_count:,}</p>
        <p class="metric-label">TV Shows</p>
    </div>
    """, unsafe_allow_html=True)

with col4:
    unique_countries = len(set([c.strip() for sub in filtered_df['country'].dropna().str.split(',') for c in sub if c.strip()]))
    st.markdown(f"""
    <div class="metric-card">
        <p class="metric-value">{unique_countries}</p>
        <p class="metric-label">Countries Represented</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Analytics Tabs
# -----------------------------------------------------------------------------
tab1, tab2, tab3, tab4 = st.tabs([
    "📈 Content Growth", 
    "🎭 Genres & Ratings", 
    "🌍 International Breakdown", 
    "🔍 Search & Discover"
])

# Tab 1: Content Growth Over Time
with tab1:
    st.subheader("Growth of Content by Release Year")
    
    growth_df = filtered_df.groupby(['release_year', 'type']).size().reset_index(name='count')
    
    fig_growth = px.line(
        growth_df,
        x='release_year',
        y='count',
        color='type',
        markers=True,
        color_discrete_map={'Movie': '#E50914', 'TV Show': '#FFFFFF'},
        labels={'release_year': 'Release Year', 'count': 'Number of Titles', 'type': 'Type'},
        template='plotly_dark'
    )
    fig_growth.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        hovermode='x unified',
        font=dict(family="Inter, sans-serif")
    )
    st.plotly_chart(fig_growth, use_container_width=True)

# Tab 2: Genres & Ratings
with tab2:
    col_g1, col_g2 = st.columns(2)
    
    with col_g1:
        st.subheader("Top Genres & Categories")
        genres_series = filtered_df['listed_in'].dropna().str.split(', ').explode()
        top_genres = genres_series.value_counts().head(10).reset_index()
        top_genres.columns = ['Genre', 'Count']
        
        fig_genre = px.bar(
            top_genres,
            x='Count',
            y='Genre',
            orientation='h',
            color='Count',
            color_continuous_scale=['#444', '#E50914'],
            template='plotly_dark'
        )
        fig_genre.update_layout(
            yaxis={'categoryorder': 'total ascending'},
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)',
            coloraxis_showscale=False
        )
        st.plotly_chart(fig_genre, use_container_width=True)

    with col_g2:
        st.subheader("Content Ratings Distribution")
        rating_counts = filtered_df['rating'].value_counts().reset_index()
        rating_counts.columns = ['Rating', 'Count']
        
        fig_rating = px.pie(
            rating_counts,
            names='Rating',
            values='Count',
            hole=0.45,
            color_discrete_sequence=px.colors.sequential.Reds_r,
            template='plotly_dark'
        )
        fig_rating.update_layout(
            plot_bgcolor='rgba(0,0,0,0)',
            paper_bgcolor='rgba(0,0,0,0)'
        )
        st.plotly_chart(fig_rating, use_container_width=True)

# Tab 3: International Breakdown
with tab3:
    st.subheader("Top Content Producing Countries")
    
    country_series = filtered_df['country'].dropna().str.split(', ').explode()
    country_series = country_series[country_series != 'Unknown']
    top_countries = country_series.value_counts().head(15).reset_index()
    top_countries.columns = ['Country', 'Total Titles']
    
    fig_country = px.bar(
        top_countries,
        x='Country',
        y='Total Titles',
        color='Total Titles',
        color_continuous_scale='Reds',
        template='plotly_dark'
    )
    fig_country.update_layout(
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        coloraxis_showscale=False
    )
    st.plotly_chart(fig_country, use_container_width=True)

# Tab 4: Search & Discover
with tab4:
    st.subheader("Search Titles Database")
    
    search_query = st.text_input("Search by title, director, or cast member", "")
    
    display_df = filtered_df.copy()
    if search_query:
        query = search_query.lower()
        display_df = display_df[
            display_df['title'].str.lower().str.contains(query, na=False) |
            display_df['director'].str.lower().str.contains(query, na=False) |
            display_df['cast'].str.lower().str.contains(query, na=False)
        ]
    
    st.dataframe(
        display_df[['title', 'type', 'release_year', 'rating', 'duration', 'country', 'listed_in', 'director']],
        use_container_width=True,
        hide_index=True
    )
    
    st.markdown("---")
    st.subheader("🎲 Random Title Recommender")
    if st.button("Surprise Me with a Pick!"):
        if len(display_df) > 0:
            random_pick = display_df.sample(1).iloc[0]
            st.success(f"🍿 **{random_pick['title']}** ({random_pick['release_year']}) — *{random_pick['type']}*")
            st.write(f"**Genres:** {random_pick['listed_in']} | **Rating:** {random_pick['rating']} | **Duration:** {random_pick['duration']}")
            st.write(f"**Description:** {random_pick['description']}")
        else:
            st.warning("No titles found matching current filters.")
