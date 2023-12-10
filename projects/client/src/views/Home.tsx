import { Container } from '@/components/shared'

const Home = () => {
    return (
        <Container className="flex h-full items-center justify-center" data-tn="home-page">
            <img
                src="/img/others/home.svg"
                alt="welcome"
                style={{ maxWidth: '100%', width: '1000px' }}
            />
        </Container>
    )
}

export default Home
